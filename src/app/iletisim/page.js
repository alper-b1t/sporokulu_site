'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching settings:', err);
        setLoading(false);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('Lütfen zorunlu alanları (* işaretli) doldurunuz.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const waUrl = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`
    : 'https://wa.me/90530816431';

  const secondaryColor = settings?.secondary_color || '#FDB912';

  return (
    <section className="section contact-page">
      <div className="container">
        <h1 className="section-title">İLETİŞİM</h1>
        <p className="page-subtitle">
          Kulübümüzle ilgili her türlü soru, öneri, altyapı seçmeleri ve spor okulları hakkında detaylı bilgi almak için bizimle iletişime geçin.
        </p>

        <div className="grid-2 contact-layout-grid">

          {/* Left Column: Contact details */}
          <div className="contact-info-col">
            <h2 className="info-title">İrtibat Bilgilerimiz</h2>
            <p className="info-desc">
              Mesai saatleri içerisinde telefon numaralarımızdan bizlere ulaşabilir, kulübümüzü ziyaret edebilir veya 7/24 e-posta gönderip WhatsApp üzerinden yazabilirsiniz.
            </p>

            <ul className="info-list">
              <li>
                <div className="info-icon-wrapper" style={{ '--icon-color': secondaryColor }}>
                  <MapPin size={22} />
                </div>
                <div className="info-detail-text">
                  <h4>Adres</h4>
                  <p>{settings?.address || 'Nef Stadyumu, Huzur Mh., Seyrantepe, Sarıyer, İstanbul'}</p>
                </div>
              </li>
              <li>
                <div className="info-icon-wrapper" style={{ '--icon-color': secondaryColor }}>
                  <Phone size={22} />
                </div>
                <div className="info-detail-text">
                  <h4>Telefon</h4>
                  {settings?.phone ? (
                    <a href={`tel:${settings.phone}`}>{settings.phone}</a>
                  ) : (
                    <span>+90 212 305 1905</span>
                  )}
                </div>
              </li>
              <li>
                <div className="info-icon-wrapper" style={{ '--icon-color': secondaryColor }}>
                  <Mail size={22} />
                </div>
                <div className="info-detail-text">
                  <h4>E-posta</h4>
                  {settings?.email ? (
                    <a href={`mailto:${settings.email}`}>{settings.email}</a>
                  ) : (
                    <span>info@galatasporkulubu.org.tr</span>
                  )}
                </div>
              </li>
            </ul>

            <div className="wa-panel glass-panel">
              <h3 className="wa-panel-title">WhatsApp Hızlı Destek</h3>
              <p className="wa-panel-desc">WhatsApp sohbet hattımız üzerinden müşteri ilişkileri ekibimize anında bağlanabilirsiniz.</p>
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="wa-large-btn">
                <MessageSquare size={20} />
                <span>WhatsApp'tan İletişime Geç</span>
              </a>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="contact-form-col">
            <div className="glass-panel form-panel">
              {isSubmitted ? (
                <div className="success-message">
                  <CheckCircle2 size={64} className="success-icon" style={{ color: '#22c55e' }} />
                  <h2>Mesajınız İletildi!</h2>
                  <p>Bizimle iletişime geçtiğiniz için teşekkür ederiz. En kısa sürede e-posta adresiniz üzerinden geri dönüş sağlayacağız.</p>
                  <button className="btn btn-secondary" onClick={() => setIsSubmitted(false)}>
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <h3 className="form-panel-title">Bizlere Yazın</h3>

                  {errorMsg && <div className="error-alert">{errorMsg}</div>}

                  <div className="form-group">
                    <label className="form-label">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Ad Soyad"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">E-posta Adresiniz *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="eposta@adresiniz.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Konu</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Mesaj konusu"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mesajınız *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="Lütfen mesajınızı detaylıca yazınız..."
                      required
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn btn-primary form-submit-btn">
                    <Send size={16} />
                    <span>{isSubmitting ? 'Gönderiliyor...' : 'Mesajı Gönder'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Google Map Frame */}
        <div className="map-section section">
          <h2 className="section-title">Stadyum / Konum</h2>
          <div className="map-wrapper glass-panel">
            <iframe
              src="https://maps.google.com/maps?q=89XG%2BQWM+Battalgazi%2C+Malatya&output=embed&hl=tr&z=17"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

      </div>

      <style jsx>{`
        .contact-page {
          background-color: var(--bg-color);
          min-height: 80vh;
        }
        .page-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          max-width: 700px;
          line-height: 1.6;
          margin-bottom: 50px;
        }
        .contact-layout-grid {
          align-items: start;
        }
        .contact-info-col {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .info-title {
          font-size: 26px;
          font-weight: 700;
          color: white;
        }
        .info-desc {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
        }
        
        .info-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .info-list li {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .info-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--icon-color);
          flex-shrink: 0;
        }
        .info-detail-text h4 {
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }
        .info-detail-text p, .info-detail-text a {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
        }
        .info-detail-text a:hover {
          color: white;
        }

        .wa-panel {
          padding: 24px;
          border-left: 4px solid #25d366;
        }
        .wa-panel-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }
        .wa-panel-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .wa-large-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: #25d366;
          color: white;
          font-weight: 600;
          border-radius: 8px;
          text-transform: uppercase;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.2);
          transition: 0.2s;
        }
        .wa-large-btn:hover {
          background: #20ba5a;
          transform: translateY(-1px);
        }

        /* Form styling */
        .form-panel {
          padding: 35px;
        }
        .form-panel-title {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
        }
        .form-submit-btn {
          width: 100%;
          margin-top: 10px;
        }
        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 12px;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        /* Success screen */
        .success-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 10px;
        }
        :global(.success-icon) {
          margin-bottom: 20px;
        }
        .success-message h2 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }
        .success-message p {
          font-size: 15px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 400px;
        }

        .map-wrapper {
          padding: 10px;
        }

        @media (max-width: 768px) {
          .form-panel {
            padding: 24px;
          }
        }
      `}</style>
    </section>
  );
}
