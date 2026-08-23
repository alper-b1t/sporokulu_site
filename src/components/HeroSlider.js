'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function HeroSlider({ slides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Auto rotate every 5s
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!slides || slides.length === 0) {
    // Fallback default slide if no data
    return (
      <div className="slider-fallback">
        <div className="container">
          <h2>Galata Spor Kulübü</h2>
          <p>Yenilmez Armada, Şampiyonlar Ligi Sezonuna Hazırlanıyor.</p>
        </div>
        <style jsx>{`
          .slider-fallback {
            height: 500px;
            background: linear-gradient(135deg, #1c1c1f, #0f0f11);
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
          }
          h2 { font-size: 36px; margin-bottom: 12px; }
        `}</style>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <section className="hero-slider-section">
      <div className="slider-container">
        {slides.map((slide, index) => {
          const isActive = index === current;
          return (
            <div
              key={slide.id || index}
              className={`slide ${isActive ? 'active' : ''}`}
              style={{ backgroundImage: `linear-gradient(to top, rgba(12,12,14,0.95) 10%, rgba(12,12,14,0.4) 60%, rgba(12,12,14,0.1)), url(${slide.image_url})` }}
            >
              <div className="slide-content-wrapper container">
                <div className="slide-badge">GÜNCEL GELİŞME</div>
                <h1 className="slide-title">{slide.title}</h1>
                <p className="slide-desc">{slide.summary}</p>
                <div className="slide-actions">
                  <Link href={`/haberler/${slide.slug}`} className="btn btn-primary">
                    Detayları Gör
                  </Link>
                  <Link href="/haberler" className="btn btn-secondary">
                    Tüm Haberler
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button className="slider-arrow arrow-left" onClick={handlePrev} aria-label="Önceki Slayt">
              <ArrowLeft size={24} />
            </button>
            <button className="slider-arrow arrow-right" onClick={handleNext} aria-label="Sonraki Slayt">
              <ArrowRight size={24} />
            </button>
          </>
        )}

        {/* Indicators dots */}
        {slides.length > 1 && (
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === current ? 'active' : ''}`}
                onClick={() => setCurrent(index)}
                aria-label={`Slayt ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hero-slider-section {
          position: relative;
          width: 100%;
          height: 620px;
          overflow: hidden;
          background-color: #0c0c0e;
        }
        .slider-container {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.8s ease-in-out, visibility 0.8s ease-in-out;
          display: flex;
          align-items: center;
          z-index: 1;
        }
        .slide.active {
          opacity: 1;
          visibility: visible;
          z-index: 2;
        }
        .slide-content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          max-width: 800px;
        }
        .slide-badge {
          background: var(--secondary-color);
          color: #121212;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 4px;
          margin-bottom: 20px;
          letter-spacing: 1px;
          transform: translateY(20px);
          opacity: 0;
          transition: 0.5s ease-out 0.3s;
        }
        .slide.active .slide-badge {
          transform: translateY(0);
          opacity: 1;
        }
        .slide-title {
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          color: white;
          margin-bottom: 18px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.5);
          transform: translateY(30px);
          opacity: 0;
          transition: 0.6s ease-out 0.4s;
        }
        .slide.active .slide-title {
          transform: translateY(0);
          opacity: 1;
        }
        .slide-desc {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.6;
          margin-bottom: 30px;
          text-shadow: 0 1px 5px rgba(0,0,0,0.5);
          transform: translateY(30px);
          opacity: 0;
          transition: 0.6s ease-out 0.5s;
        }
        .slide.active .slide-desc {
          transform: translateY(0);
          opacity: 1;
        }
        .slide-actions {
          display: flex;
          gap: 16px;
          transform: translateY(30px);
          opacity: 0;
          transition: 0.6s ease-out 0.6s;
        }
        .slide.active .slide-actions {
          transform: translateY(0);
          opacity: 1;
        }
        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(12, 12, 14, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: var(--transition-fast);
        }
        .slider-arrow:hover {
          background: var(--primary-color);
          border-color: var(--primary-color);
          transform: translateY(-50%) scale(1.05);
        }
        .arrow-left {
          left: 24px;
        }
        .arrow-right {
          right: 24px;
        }
        .slider-dots {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .dot.active {
          background: var(--secondary-color);
          width: 28px;
          border-radius: 10px;
        }
        @media (max-width: 768px) {
          .hero-slider-section {
            height: 480px;
          }
          .slide-title {
            font-size: 32px;
          }
          .slide-desc {
            font-size: 15px;
          }
          .slider-arrow {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
