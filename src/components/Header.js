'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShieldAlert } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Fetch site settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch((err) => console.error('Error fetching settings:', err));

    // Check if logged in as admin to show admin shortcut
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      })
      .catch(() => setIsAdmin(false));
  }, [pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Yönetim', path: '/yonetim' },
    { name: 'Teknik Heyet', path: '/teknik-heyet' },
    { name: 'Spor Branşları', path: '/spor-branslari' },
    { name: 'Fikstür', path: '/fikstur' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Haberler', path: '/haberler' },
    { name: 'Duyurular', path: '/duyurular' },
    { name: 'İletişim', path: '/iletisim' },
  ];

  // We hide the public header when on admin page, because the admin panel has its own sidebar layout!
  const isAdminPage = pathname?.startsWith('/admin');
  if (isAdminPage) {
    return null;
  }

  const primaryColor = settings?.primary_color || '#A90432';
  const secondaryColor = settings?.secondary_color || '#FDB912';

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link href="/" className="logo-area" onClick={closeMenu}>
          {settings?.logo_url ? (
            <div className="logo-wrapper">
              {/* Using standard img for ease of local updates */}
              <img src={settings.logo_url} alt={settings.club_name || 'Logo'} className="header-logo" onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }} />
              <span className="logo-text-fallback" style={{ display: 'none' }}>
                {settings.club_name}
              </span>
            </div>
          ) : (
            <span className="logo-text">{settings?.club_name || 'GALATASARAY'}</span>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Menüyü Aç/Kapat">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`mobile-nav-overlay ${isOpen ? 'open' : ''}`}>
        <nav className="mobile-nav">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
