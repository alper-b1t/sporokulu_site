'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Error fetching settings:', err));

    // Fetch sports branches
    fetch('/api/sports')
      .then((res) => res.json())
      .then((data) => setBranches(data.slice(0, 4))) // Only show top 4 in footer
      .catch((err) => console.error('Error fetching branches:', err));
  }, [pathname]);

  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  const currentYear = new Date().getFullYear();
  const primaryColor = settings?.primary_color || '#A90432';
  const secondaryColor = settings?.secondary_color || '#FDB912';

  // WhatsApp click handler
  const waUrl = settings?.whatsapp
    ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`
    : 'https://wa.me/905051905190';

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {/* Branding & Desc */}
        <div className="footer-col brand-col">
          <Link href="/" className="footer-logo-link">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={settings.club_name || 'Logo'} className="footer-logo" />
            ) : (
              <span className="footer-logo-text">{settings?.club_name || 'GALATA'}</span>
            )}
          </Link>
          <p className="footer-desc">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ornare dui ac suscipit pellentesque. Mauris porta hendrerit sagittis. Fusce vel justo mauris. Morbi eu dapibus purus. Nam odio massa, consequat in tempus sed, ultrices ac nunc. Vestibulum dignissim magna massa, eget mattis ipsum molestie quis. Sed molestie aliquam scelerisque. Suspendisse porttitor diam eget augue dictum iaculis. Maecenas eget volutpat nisi. Aliquam id metus tortor. Donec ac rhoncus odio, vitae finibus turpis. Cras et faucibus augue. Pellentesque interdum quam eu turpis posuere commodo.
          </p>
          <div className="social-links">
            {settings?.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col links-col">
          <h4 className="footer-title" style={{ '--accent': secondaryColor }}>Hızlı Menü</h4>
          <ul className="footer-links-list">
            <li><Link href="/">Ana Sayfa</Link></li>
            <li><Link href="/yonetim">Yönetim Kurulu</Link></li>
            <li><Link href="/teknik-heyet">Teknik Kadro</Link></li>
            <li><Link href="/fikstur">Fikstür ve Maçlar</Link></li>
            <li><Link href="/galeri">Fotoğraf Galerisi</Link></li>
            <li><Link href="/haberler">Haber Arşivi</Link></li>
            <li><Link href="/iletisim">İletişim</Link></li>
          </ul>
        </div>

        {/* Branches */}
        <div className="footer-col links-col">
          <h4 className="footer-title" style={{ '--accent': secondaryColor }}>Spor Branşları</h4>
          <ul className="footer-links-list">
            {branches.length > 0 ? (
              branches.map((branch) => (
                <li key={branch.id}>
                  <Link href="/spor-branslari">{branch.name}</Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/spor-branslari">Futbol</Link></li>
                <li><Link href="/spor-branslari">Basketbol</Link></li>
                <li><Link href="/spor-branslari">Voleybol</Link></li>
                <li><Link href="/spor-branslari">Espor</Link></li>
              </>
            )}
            <li><Link href="/spor-branslari" className="view-all-branches">Tüm Branşlar →</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="footer-col contact-col">
          <h4 className="footer-title" style={{ '--accent': secondaryColor }}>İletişim Bilgileri</h4>
          <ul className="footer-contact-list">
            {settings?.address && (
              <li>
                <MapPin size={18} className="contact-icon" style={{ color: secondaryColor }} />
                <span>{settings.address}</span>
              </li>
            )}
            {settings?.phone && (
              <li>
                <Phone size={18} className="contact-icon" style={{ color: secondaryColor }} />
                <a href={`tel:${settings.phone}`}>{settings.phone}</a>
              </li>
            )}
            {settings?.email && (
              <li>
                <Mail size={18} className="contact-icon" style={{ color: secondaryColor }} />
                <a href={`mailto:${settings.email}`}>{settings.email}</a>
              </li>
            )}
          </ul>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="footer-wa-btn">
            <MessageSquare size={18} />
            <span>WhatsApp Destek</span>
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="container bottom-container">
          <p>© {currentYear} {settings?.club_name || 'Galata Spor Kulübü'}. Tüm hakları saklıdır.</p>
        </div>
      </div>

      <style jsx>{`
        .site-footer {
          background-color: #0c0c0e;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 80px 0 0 0;
          margin-top: auto;
          color: rgba(255, 255, 255, 0.7);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1.5fr;
          gap: 40px;
          margin-bottom: 60px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
        }
        .footer-logo-link {
          margin-bottom: 20px;
          display: inline-block;
        }
        .footer-logo {
          height: 64px;
          width: auto;
          object-fit: contain;
        }
        .footer-logo-text {
          font-size: 22px;
          font-weight: 800;
          color: white;
        }
        .footer-desc {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .social-links {
          display: flex;
          gap: 12px;
        }
        .social-links a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          color: white;
          transition: var(--transition-fast);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .social-links a:hover {
          background: ${primaryColor};
          color: white;
          transform: translateY(-2px);
        }
        .footer-title {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 24px;
          position: relative;
          padding-bottom: 8px;
          text-transform: uppercase;
        }
        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: var(--accent);
          border-radius: 2px;
        }
        .footer-links-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 15px;
        }
        .footer-links-list a:hover {
          color: white;
          padding-left: 4px;
        }
        .view-all-branches {
          color: ${secondaryColor};
          font-weight: 600;
        }
        .footer-contact-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 16px;
          font-size: 15px;
          margin-bottom: 24px;
        }
        .footer-contact-list li {
          display: flex;
          gap: 12px;
          line-height: 1.5;
        }
        .contact-icon {
          flex-shrink: 0;
        }
        .footer-contact-list a:hover {
          color: white;
        }
        .footer-wa-btn {
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
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(37, 211, 102, 0.2);
        }
        .footer-wa-btn:hover {
          background: #20ba5a;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 30px 0;
          font-size: 14px;
          background-color: #08080a;
        }
        .bottom-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }
        .admin-login-link {
          color: rgba(255, 255, 255, 0.3);
        }
        .admin-login-link:hover {
          color: ${secondaryColor};
        }
        @media (max-width: 991px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }
        @media (max-width: 576px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
          .bottom-container {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
