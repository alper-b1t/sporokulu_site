import Link from 'next/link';
import { db } from '@/lib/db';

export const revalidate = 0;

export default async function NewsList() {
  const news = await db.all('SELECT * FROM news WHERE status = "published" ORDER BY published_at DESC');

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="section news-page">
      <div className="container">
        <h1 className="section-title">Haberler</h1>
        <p className="page-subtitle">
          Kulübümüzden son gelişmeler, transfer duyuruları, maç analizleri ve resmi açıklamalar.
        </p>

        <div className="grid-3 news-grid">
          {news.map((item) => (
            <div key={item.id} className="card news-card">
              <div className="card-img-wrapper">
                <img src={item.image_url} alt={item.title} className="card-img" />
              </div>
              <div className="card-body">
                <div className="card-meta">
                  <span>{formatDate(item.published_at)}</span>
                </div>
                <h3 className="card-title">
                  <Link href={`/haberler/${item.slug}`}>{item.title}</Link>
                </h3>
                <p className="card-text">{item.summary}</p>
                <div className="card-footer">
                  <Link href={`/haberler/${item.slug}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    Devamını Oku
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {news.length === 0 && (
            <p className="empty-state">Henüz yayınlanmış haber bulunmamaktadır.</p>
          )}
        </div>
      </div>
    </section>
  );
}
