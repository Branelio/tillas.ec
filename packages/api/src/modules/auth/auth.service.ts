import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  // ─── REGISTER ───────────────────────────────────────
  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Este email ya está registrado');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const referralCode = `TIL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Buscar referidor
    let referredById: string | undefined;
    if (dto.referralCode) {
      const referrer = await this.prisma.user.findUnique({
        where: { referralCode: dto.referralCode },
      });
      if (referrer) referredById = referrer.id;
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        phone: dto.phone,
        favoriteSizes: dto.favoriteSizes || [],
        referralCode,
        referredBy: referredById,
        otpCode,
        otpExpiresAt,
        isVerified: false,
      },
    });

    // Enviar OTP por email
    await this.mail.sendOtp(user.email, user.name, otpCode);

    return {
      message: 'Registro exitoso. Verifica tu email con el código OTP.',
      userId: user.id,
      email: user.email,
    };
  }

  // ─── RESEND OTP ────────────────────────────────────
  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.isVerified) throw new BadRequestException('Esta cuenta ya está verificada');

    const otpCode = this.generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    await this.mail.sendOtp(user.email, user.name, otpCode);

    return { message: 'Nuevo código OTP enviado a tu email.' };
  }

  // ─── VERIFY OTP ─────────────────────────────────────
  async verifyOtp(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Usuario no encontrado');
    if (user.isVerified) throw new BadRequestException('Esta cuenta ya está verificada');
    if (!user.otpCode || !user.otpExpiresAt)
      throw new BadRequestException('No hay código OTP pendiente');
    if (new Date() > user.otpExpiresAt)
      throw new BadRequestException('El código OTP ha expirado. Solicita uno nuevo');
    if (user.otpCode !== code)
      throw new BadRequestException('Código OTP incorrecto');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    // Puntos de primera compra se otorgan en la primera compra, no aquí
    return {
      message: 'Email verificado exitosamente',
      user: this.sanitize(user),
      ...tokens,
    };
  }

  // ─── LOGIN ──────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash)
      throw new UnauthorizedException('Credenciales inválidas');

    if (!user.isVerified)
      throw new UnauthorizedException('Debes verificar tu email antes de iniciar sesión');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitize(user),
      ...tokens,
    };
  }

  // ─── GOOGLE LOGIN ───────────────────────────────────
  async googleLogin(idToken: string) {
    // Verificar idToken con Google
    const googlePayload = await this.verifyGoogleToken(idToken);
    if (!googlePayload)
      throw new UnauthorizedException('Token de Google inválido');

    const { sub: googleId, email, name, picture } = googlePayload;

    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      // Buscar por email (vincular cuenta existente)
      user = await this.prisma.user.findUnique({ where: { email } });
      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: picture || user.avatar, isVerified: true },
        });
      } else {
        // Crear nueva cuenta (verificada automáticamente)
        const referralCode = `TIL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            googleId,
            avatar: picture,
            isVerified: true,
            referralCode,
          },
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return { user: this.sanitize(user), ...tokens };
  }

  // ─── REFRESH TOKEN ──────────────────────────────────
  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.refreshToken)
        throw new UnauthorizedException('Acceso denegado');

      const valid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!valid) throw new UnauthorizedException('Token inválido o expirado');

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  // ─── LOGOUT ─────────────────────────────────────────
  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, fcmToken: null },
    });
    return { message: 'Sesión cerrada exitosamente' };
  }

  // ─── HELPERS ────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }

  private async verifyGoogleToken(idToken: string): Promise<any> {
    try {
      // Verificar con Google OAuth2 API
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
      );
      if (!response.ok) return null;
      const payload = await response.json();

      // Verificar audience (client ID)
      const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
      if (payload.aud !== clientId) return null;

      return payload;
    } catch {
      return null;
    }
  }

  private sanitize(user: any) {
    const { passwordHash, refreshToken, otpCode, otpExpiresAt, ...safe } = user;
    return safe;
  }
}
