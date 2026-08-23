import Link from 'next/link';
import { db } from '@/lib/db';
import HeroSlider from '@/components/HeroSlider';
import { Calendar, Bell, Newspaper, MapPin, Trophy, ShieldRight } from 'lucide-react';

export const revalidate = 0; // Disable caching to fetch real-time updates from SQLite

export default async function Home() {
  // 1. Fetch slider data (latest news)
  const sliderNews = await db.all('SELECT * FROM news WHERE status = "published" ORDER BY published_at DESC LIMIT 3');

  // 2. Fetch list news (latest news)
  const newsList = await db.all('SELECT * FROM news WHERE status = "published" ORDER BY published_at DESC LIMIT 3');

  // 3. Fetch announcements
  const announcementsList = await db.all('SELECT * FROM announcements WHERE status = "published" ORDER BY published_at DESC LIMIT 3');

  // 4. Fetch fixtures (both upcoming and recent)
  const fixturesList = await db.all('SELECT * FROM fixtures ORDER BY date DESC, time DESC LIMIT 3');

  // Helper to format date
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="home-wrapper">
      {/* 1. Hero Image Slider */}
      <HeroSlider slides={sliderNews} />

      {/* 2. Main Three-Column Highlights Area */}
      <section className="section highlights-section">
        <div className="container">
          <div className="highlights-grid">

            {/* Column 1: News (Haberler) */}
            <div className="highlight-col news-column">
              <div className="column-header">
                <Newspaper className="column-icon" />
                <h3 className="column-title">Son Haberler</h3>
              </div>

              <div className="column-items">
                {newsList.map((news) => (
                  <Link href={`/haberler/${news.slug}`} key={news.id} className="highlight-item-link">
                    <div className="highlight-item-meta">
                      <span className="bullet-decor primary-bullet"></span>
                      <span className="highlight-item-date">{formatDate(news.published_at)}</span>
                    </div>
                    <h4 className="highlight-item-title">{news.title}</h4>
                  </Link>
                ))}
                {newsList.length === 0 && (
                  <p className="empty-state">Henüz yayınlanmış haber bulunmamaktadır.</p>
                )}
              </div>

              <div className="column-footer-link-wrapper">
                <Link href="/haberler" className="column-footer-link">Tümü →</Link>
              </div>
            </div>

            {/* Column 2: Announcements (Duyurular) */}
            <div className="highlight-col announcements-column">
              <div className="column-header">
                <Bell className="column-icon" />
                <h3 className="column-title">Duyurular</h3>
              </div>

              <div className="column-items">
                {announcementsList.map((ann) => (
                  <Link href="/duyurular" key={ann.id} className="highlight-item-link">
                    <div className="highlight-item-meta">
                      <span className="bullet-decor secondary-bullet"></span>
                      <span className="highlight-item-date">{formatDate(ann.published_at)}</span>
                    </div>
                    <h4 className="highlight-item-title">{ann.title}</h4>
                  </Link>
                ))}
                {announcementsList.length === 0 && (
                  <p className="empty-state">Henüz duyuru bulunmamaktadır.</p>
                )}
              </div>

              <div className="column-footer-link-wrapper">
                <Link href="/duyurular" className="column-footer-link">Tümü →</Link>
              </div>
            </div>

            {/* Column 3: Fixtures (Fikstür) */}
            <div className="highlight-col fixtures-column">
              <div className="column-header">
                <Calendar className="column-icon" />
                <h3 className="column-title">Fikstür / Maçlar</h3>
              </div>

              <div className="column-items">
                {fixturesList.map((fix) => {
                  const isPlayed = fix.status === 'played';
                  return (
                    <div key={fix.id} className="match-inner-card">
                      <div className="match-league">
                        <Trophy size={13} className="league-icon" />
                        <span>{fix.league}</span>
                      </div>

                      <div className="match-teams-vs">
                        <span className="match-team-name home-team-align" style={{ textAlign: 'right' }}>{fix.home_team}</span>
                        <span className="match-vs-badge">
                          {isPlayed ? `${fix.home_score} - ${fix.away_score}` : 'VS'}
                        </span>
                        <span className="match-team-name">{fix.away_team}</span>
                      </div>

                      <div className="match-details-row">
                        <span className="match-date-time">{formatDate(fix.date)} • {fix.time}</span>
                        <span className="match-stadium">📍 {fix.stadium}</span>
                      </div>
                    </div>
                  );
                })}
                {fixturesList.length === 0 && (
                  <p className="empty-state">Yaklaşan maç bulunmamaktadır.</p>
                )}
              </div>

              <div className="column-footer-link-wrapper">
                <Link href="/fikstur" className="column-footer-link">Tümü →</Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Mid CTA Showcase Section */}
      <section className="section bg-showcase" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.85), rgba(169,4,50,0.3)), url(/uploads/gallery_fans.jpg)' }}>
        <div className="container showcase-container">
          <div className="showcase-content">
            <h2 className="showcase-title">Sarı Kırmızı Sevdamızla Geleceğe!</h2>
            <p className="showcase-desc">
              Kulübümüzün spor okulları seçmeleri, altyapı faaliyetleri ve üyelik işlemleriyle ilgili detaylı bilgi almak için iletişim formumuz üzerinden veya doğrudan WhatsApp destek hattımızdan bizimle iletişime geçebilirsiniz.
            </p>
            <div className="showcase-actions">
              <Link href="/iletisim" className="btn btn-primary ">İletişime Geç</Link>
              <Link href="/spor-branslari" className="btn btn-secondary">Spor Branşlarımız</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
