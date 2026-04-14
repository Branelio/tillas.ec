export interface Environment {
  nodeEnv: string;
  apiPort: number;
  apiUrl: string;
  webUrl: string;
  adminUrl: string;
  databaseUrl: string;
  redisHost: string;
  redisPort: number;
  redisPassword: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  googleClientId: string;
  googleClientSecret: string;
  // Bank account configuration
  bankName: string;
  bankAccount: string;
  bankAccountType: string;
  bankHolder: string;
  bankIdNumber: string;
  minioEndpoint: string;
  minioPort: number;
  minioAccessKey: string;
  minioSecretKey: string;
  minioBucket: string;
  minioPublicUrl: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  firebaseProjectId: string;
  firebasePrivateKey: string;
  firebaseClientEmail: string;
}

export const environment: Environment = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPort: parseInt(process.env.API_PORT || '4000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:4000',
  webUrl: process.env.WEB_URL || 'http://localhost:3000',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:3001',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/tillas',
  redisHost: process.env.REDIS_HOST || 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
  redisPassword: process.env.REDIS_PASSWORD || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  // Bank account
  bankName: process.env.BANK_NAME || 'Banco Pichincha',
  bankAccount: process.env.BANK_ACCOUNT || '2209004611',
  bankAccountType: process.env.BANK_ACCOUNT_TYPE || 'Ahorros',
  bankHolder: process.env.BANK_HOLDER || 'BRANDON JOEL',
  bankIdNumber: process.env.BANK_ID_NUMBER || '',
  minioEndpoint: process.env.MINIO_ENDPOINT || 'localhost',
  minioPort: parseInt(process.env.MINIO_PORT || '9000', 10),
  minioAccessKey: process.env.MINIO_ACCESS_KEY || '',
  minioSecretKey: process.env.MINIO_SECRET_KEY || '',
  minioBucket: process.env.MINIO_BUCKET || 'tillas-media',
  minioPublicUrl: process.env.MINIO_PUBLIC_URL || 'http://localhost:9000',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'noreply@tillas.ec',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || '',
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
};
