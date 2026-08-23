'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching gallery:', err);
        setLoading(false);
      });
  }, []);

  // Filter items based on active category
  const filteredItems = activeCategory === 'Tümü'
    ? items
    : items.filter(item => item.category === activeCategory);

  // Get unique categories
  const categories = ['Tümü', ...new Set(items.map(item => item.category))];

  // Lightbox handlers
  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  const currentItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section className="section gallery-page">
      <div className="container">
        <h1 className="section-title">Fotoğraf Galerisi</h1>
        <p className="page-subtitle">
          Takımımızın maçları, antrenmanları ve taraftarlarımızın unutulmaz anlarından objektiflere yansıyan kareler.
        </p>

        {/* Filter Categories */}
        {!loading && categories.length > 1 && (
          <div className="filter-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(cat);
                  closeLightbox();
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Fotoğraflar yükleniyor...</div>
        ) : (
          <>
            <div className="gallery-grid">
              {filteredItems.map((item, index) => (
                <div key={item.id} className="gallery-item" onClick={() => openLightbox(index)}>
                  <img src={item.image_url} alt={item.title} className="gallery-img" />
                  <div className="gallery-hover-overlay">
                    <span className="gallery-hover-cat">{item.category}</span>
                    <h4 className="gallery-hover-title">{item.title}</h4>
                    <span className="gallery-view-text">Büyütmek için tıkla</span>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="empty-gallery">
                  <ImageIcon size={48} className="empty-icon" />
                  <p>Bu kategoride henüz fotoğraf bulunmamaktadır.</p>
                </div>
              )}
            </div>

            {/* Lightbox Modal */}
            {lightboxIndex !== null && currentItem && (
              <div className="lightbox" onClick={closeLightbox}>
                <button className="lightbox-close" onClick={closeLightbox}>
                  <X />
                </button>

                {filteredItems.length > 1 && (
                  <>
                    <button className="lightbox-arrow arrow-left" onClick={prevSlide}>
                      <ChevronLeft size={36} />
                    </button>
                    <button className="lightbox-arrow arrow-right" onClick={nextSlide}>
                      <ChevronRight size={36} />
                    </button>
                  </>
                )}

                <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                  <img src={currentItem.image_url} alt={currentItem.title} className="lightbox-img" />
                  <div className="lightbox-caption">
                    <span className="lightbox-cat-badge">{currentItem.category}</span>
                    <h3 className="lightbox-title-text">{currentItem.title}</h3>
                    {currentItem.description && (
                      <p className="lightbox-description-text">{currentItem.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .gallery-page {
          background-color: var(--bg-color);
          min-height: 70vh;
        }
        .page-subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.7);
          max-width: 700px;
          line-height: 1.6;
          margin-bottom: 40px;
        }
        
        /* Categories Filter Tabs */
        .filter-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 40px;
        }
        .filter-tab {
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.8);
          transition: var(--transition-fast);
        }
        .filter-tab:hover, .filter-tab.active {
          background: var(--primary-color);
          border-color: var(--primary-color);
          color: white;
        }
        .filter-tab.active {
          box-shadow: 0 4px 12px rgba(169,4,50,0.3);
        }

        /* Gallery Grid */
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }
        .gallery-item {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background-color: var(--accent-color);
        }
        .gallery-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .gallery-item:hover .gallery-img {
          transform: scale(1.05);
        }
        
        /* Hover Overlay */
        .gallery-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(12,12,14,0.9) 20%, rgba(12,12,14,0.2) 60%, rgba(12,12,14,0));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gallery-item:hover .gallery-hover-overlay {
          opacity: 1;
        }
        .gallery-hover-cat {
          font-size: 11px;
          font-weight: 700;
          color: var(--secondary-color);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .gallery-hover-title {
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
        }
        .gallery-view-text {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        .empty-gallery {
          grid-column: span 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 0;
          color: rgba(255,255,255,0.4);
          text-align: center;
        }
        :global(.empty-icon) {
          margin-bottom: 15px;
          opacity: 0.6;
        }
        .loading-state {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.5);
        }

        /* Lightbox Override */
        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          color: white;
          background: rgba(255,255,255,0.1);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .lightbox-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.2s;
          z-index: 10010;
        }
        .lightbox-arrow:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
        }
        .arrow-left {
          left: 30px;
        }
        .arrow-right {
          right: 30px;
        }
        .lightbox-cat-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          color: var(--secondary-color);
          text-transform: uppercase;
          background: rgba(253, 185, 18, 0.1);
          padding: 4px 10px;
          border-radius: 4px;
          margin-bottom: 8px;
        }
        .lightbox-title-text {
          font-size: 22px;
          font-weight: 700;
          color: white;
        }
        .lightbox-description-text {
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          margin-top: 6px;
        }

        @media (max-width: 768px) {
          .lightbox-arrow {
            display: none;
          }
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </section>
  );
}
