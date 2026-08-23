import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ChevronLeft, Calendar } from 'lucide-react';

export const revalidate = 10;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const item = await db.get('SELECT title, summary FROM news WHERE slug = ?', [slug]);
  
  if (!item) {
    return { title: 'Haber Bulunamadı' };
  }

  return {
    title: item.title,
    description: item.summary
  };
}

export default async function NewsDetail({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const news = await db.get('SELECT * FROM news WHERE slug = ?', [slug]);

  if (!news) {
    notFound();
  }

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <article className="section news-detail-page">
      <div className="container detail-container">
        
        {/* Back Link */}
        <Link href="/haberler" className="back-link">
          <ChevronLeft size={16} />
          <span>Haberlere Geri Dön</span>
        </Link>

        {/* Title */}
        <h1 className="news-title">{news.title}</h1>
        
        {/* Meta */}
        <div className="news-meta">
          <div className="meta-item">
            <Calendar size={16} />
            <span>Yayınlanma Tarihi: {formatDate(news.published_at)}</span>
          </div>
        </div>

        {/* Featured Image */}
        <div className="featured-image-wrapper">
          <img src={news.image_url} alt={news.title} className="featured-image" />
        </div>

        {/* Content */}
        <div className="news-content-body">
          <p className="news-summary-lead">{news.summary}</p>
          <div className="news-paragraphs">
            {news.content.split('\n').map((paragraph, index) => {
              if (!paragraph.trim()) return null;
              return <p key={index}>{paragraph}</p>;
            })}
          </div>
        </div>

      </div>
    </article>
  );
}
