'use client';
import { useState } from 'react';
import { MessageCircle, Instagram, Mail, Clock, MapPin, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // En producción esto enviaría al API
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Contacto</h1>
        <p className="text-gray-400 mt-2">¿Tienes preguntas? Estamos para ayudarte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* WhatsApp */}
        <a href="https://wa.me/593991234567" target="_blank" rel="noopener noreferrer"
          className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border hover:border-tillas-primary/30 transition-all text-center group">
          <MessageCircle size={28} className="mx-auto text-green-400 group-hover:scale-110 transition-transform mb-3" />
          <h3 className="font-heading font-semibold text-white text-sm">WhatsApp</h3>
          <p className="text-gray-400 text-xs mt-1">+593 99 123 4567</p>
          <p className="text-tillas-primary text-xs mt-2 font-medium">Respuesta inmediata →</p>
        </a>

        {/* Instagram */}
        <a href="https://instagram.com/tillas.ec" target="_blank" rel="noopener noreferrer"
          className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border hover:border-tillas-primary/30 transition-all text-center group">
          <Instagram size={28} className="mx-auto text-pink-400 group-hover:scale-110 transition-transform mb-3" />
          <h3 className="font-heading font-semibold text-white text-sm">Instagram</h3>
          <p className="text-gray-400 text-xs mt-1">@tillas.ec</p>
          <p className="text-tillas-primary text-xs mt-2 font-medium">Escríbenos por DM →</p>
        </a>

        {/* Email */}
        <a href="mailto:hola@tillas.ec"
          className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border hover:border-tillas-primary/30 transition-all text-center group">
          <Mail size={28} className="mx-auto text-blue-400 group-hover:scale-110 transition-transform mb-3" />
          <h3 className="font-heading font-semibold text-white text-sm">Email</h3>
          <p className="text-gray-400 text-xs mt-1">hola@tillas.ec</p>
          <p className="text-tillas-primary text-xs mt-2 font-medium">Respuesta en 24h →</p>
        </a>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <div className="bg-tillas-surface rounded-xl p-4 border border-tillas-border flex items-center gap-3">
          <Clock size={18} className="text-tillas-primary shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Horario de atención</p>
            <p className="text-gray-400 text-xs">Lunes a Viernes: 9:00 AM — 6:00 PM (ECT)</p>
            <p className="text-gray-500 text-xs">Sábados: 10:00 AM — 2:00 PM</p>
          </div>
        </div>
        <div className="bg-tillas-surface rounded-xl p-4 border border-tillas-border flex items-center gap-3">
          <MapPin size={18} className="text-tillas-primary shrink-0" />
          <div>
            <p className="text-white text-sm font-medium">Ubicación</p>
            <p className="text-gray-400 text-xs">Quito, Ecuador 🇪🇨</p>
            <p className="text-gray-500 text-xs">Solo ventas en línea</p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      {sent ? (
        <div className="bg-tillas-primary/10 border border-tillas-primary/30 rounded-2xl p-8 text-center">
          <CheckCircle size={40} className="mx-auto text-tillas-primary mb-3" />
          <h3 className="font-heading text-xl font-bold text-white">¡Mensaje Enviado!</h3>
          <p className="text-gray-400 text-sm mt-2">Te responderemos lo antes posible.</p>
          <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
            className="mt-4 text-tillas-primary text-sm font-medium hover:underline">
            Enviar otro mensaje
          </button>
        </div>
      ) : (
        <div className="bg-tillas-surface rounded-2xl p-6 border border-tillas-border">
          <h2 className="font-heading text-xl font-bold text-white mb-5">Envíanos un mensaje</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                  placeholder="Tu nombre"
                  className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                  placeholder="tu@email.com"
                  className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Asunto</label>
              <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required
                className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-tillas-primary transition-colors">
                <option value="">Selecciona un tema</option>
                <option>Pregunta sobre un producto</option>
                <option>Estado de mi pedido</option>
                <option>Devolución o cambio</option>
                <option>Problema con el pago</option>
                <option>Colaboración / Prensa</option>
                <option>Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mensaje</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required
                rows={4} placeholder="Escribe tu mensaje..."
                className="w-full bg-tillas-surfaceElevated border border-tillas-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-tillas-primary transition-colors resize-none" />
            </div>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-tillas-primary text-black font-bold rounded-xl hover:bg-tillas-primaryDark transition-colors">
              <Send size={16} /> Enviar Mensaje
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
