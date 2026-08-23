import { db } from '@/lib/db';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export async function generateMetadata() {
  try {
    const rows = await db.all('SELECT * FROM site_settings');
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    return {
      title: {
        default: settings.club_name || 'Galatasaray Spor Kulübü',
        template: `%s | ${settings.club_name || 'Galatasaray Spor Kulübü'}`
      },
      description: 'Galatasaray Spor Kulübü Resmi Web Sitesi. Güncel haberler, fikstür, duyurular, branşlar ve yönetim kurulu kadromuz.',
      icons: {
        icon: settings.logo_url || '/favicon.ico',
      }
    };
  } catch (error) {
    return {
      title: 'Galatasaray Spor Kulübü',
      description: 'Galatasaray Spor Kulübü Web Sitesi'
    };
  }
}

export default async function RootLayout({ children }) {
  let settings = {};
  try {
    const rows = await db.all('SELECT * FROM site_settings');
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
  } catch (e) {
    console.error('Error loading settings in layout:', e);
  }

  // Dynamic CSS Variables mapping from settings
  const primaryColor = settings.primary_color || '#A90432';
  const secondaryColor = settings.secondary_color || '#FDB912';
  const bgColor = settings.bg_color || '#0f0f11';
  const textColor = settings.text_color || '#ffffff';
  const accentColor = settings.accent_color || '#1c1c1f';

  return (
    <html lang="tr">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary-color: ${primaryColor};
            --secondary-color: ${secondaryColor};
            --bg-color: ${bgColor};
            --text-color: ${textColor};
            --accent-color: ${accentColor};
          }
        `}} />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
