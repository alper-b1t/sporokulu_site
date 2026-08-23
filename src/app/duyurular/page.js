import { db } from '@/lib/db';

export const revalidate = 0;

export default async function Announcements() {
  const announcements = await db.all('SELECT * FROM announcements WHERE status = "published" ORDER BY published_at DESC');

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="section announcements-page">
      <div className="container details-container">
        <h1 className="section-title">Duyurular</h1>
        <p className="page-subtitle">
          Kulübümüzün altyapı seçmeleri, antrenman değişiklikleri, maç biletleri ve etkinlik duyuruları.
        </p>

        <div className="announcements-list">
          {announcements.map((ann) => (
            <div key={ann.id} className="ann-card">
              <div className="ann-header">
                <span className="ann-date">{formatDate(ann.published_at)}</span>
                <span className={`badge ${ann.importance === 'high' ? 'badge-high' : 'badge-normal'}`}>
                  {ann.importance === 'high' ? 'Önemli Duyuru' : 'Duyuru'}
                </span>
              </div>
              <h2 className="ann-title">{ann.title}</h2>
              <div className="ann-content">
                {ann.content.split('\n').map((paragraph, index) => {
                  if (!paragraph.trim()) return null;
                  return <p key={index}>{paragraph}</p>;
                })}
              </div>
            </div>
          ))}
          {announcements.length === 0 && (
            <p className="empty-state">Henüz yayınlanmış duyuru bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </section>
  );
}
