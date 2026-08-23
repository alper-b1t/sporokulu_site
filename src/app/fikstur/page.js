'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Trophy, MapPin } from 'lucide-react';

export default function Fixtures() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'played'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('all');

  useEffect(() => {
    fetch('/api/fixtures')
      .then((res) => res.json())
      .then((data) => {
        setFixtures(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching fixtures:', err);
        setLoading(false);
      });
  }, []);

  // Filter logic
  const filteredFixtures = fixtures.filter((fix) => {
    // 1. Tab Status Filter
    if (activeTab === 'upcoming' && fix.status !== 'upcoming') return false;
    if (activeTab === 'played' && fix.status !== 'played') return false;

    // 2. League Filter
    if (selectedLeague !== 'all' && fix.league !== selectedLeague) return false;

    // 3. Search Query Filter (Home or Away team names)
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fix.home_team.toLowerCase().includes(query) ||
      fix.away_team.toLowerCase().includes(query) ||
      fix.stadium.toLowerCase().includes(query);
      
    return matchesSearch;
  });

  // Get unique leagues
  const leagues = ['all', ...new Set(fixtures.map(f => f.league))];

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="section fixtures-page">
      <div className="container">
        <h1 className="section-title">Maç Fikstürü</h1>
        <p className="page-subtitle">
          Futbol ve diğer aktif branşlarımızın en son maç sonuçları ve yaklaşan karşılaşmalarının programı.
        </p>

        {/* Filters Panel */}
        <div className="filters-panel glass-panel">
          <div className="tabs-container">
            <button
              className={`filter-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              Tüm Maçlar
            </button>
            <button
              className={`filter-tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              Yaklaşan Maçlar
            </button>
            <button
              className={`filter-tab-btn ${activeTab === 'played' ? 'active' : ''}`}
              onClick={() => setActiveTab('played')}
            >
              Geçmiş Maçlar
            </button>
          </div>

          <div className="filter-controls">
            {/* Search Input */}
            <div className="search-wrapper">
              <Search className="filter-icon" size={16} />
              <input
                type="text"
                placeholder="Rakip takım veya stadyum ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="filter-input"
              />
            </div>

            {/* League Dropdown */}
            <div className="select-wrapper">
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tüm Ligler</option>
                {leagues.filter(l => l !== 'all').map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fixtures Listing */}
        {loading ? (
          <div className="loading-state">Fikstür bilgisi yükleniyor...</div>
        ) : (
          <div className="fixtures-grid">
            {filteredFixtures.map((fix) => {
              const isPlayed = fix.status === 'played';
              return (
                <div key={fix.id} className="fixture-card-full card">
                  <div className="fixture-card-header">
                    <div className="fixture-league-tag">
                      <Trophy size={14} />
                      <span>{fix.league}</span>
                    </div>
                    <span className={`badge ${isPlayed ? 'badge-played' : 'badge-upcoming'}`}>
                      {isPlayed ? 'Oynandı' : 'Gelecek Maç'}
                    </span>
                  </div>

                  <div className="fixture-card-teams">
                    <div className="team-block home-block">
                      <span className="team-name-lg">{fix.home_team}</span>
                    </div>

                    <div className="fixture-center-block">
                      {isPlayed ? (
                        <div className="score-display">
                          <span>{fix.home_score}</span>
                          <span className="score-dash">-</span>
                          <span>{fix.away_score}</span>
                        </div>
                      ) : (
                        <div className="vs-badge-lg">VS</div>
                      )}
                    </div>

                    <div className="team-block away-block">
                      <span className="team-name-lg">{fix.away_team}</span>
                    </div>
                  </div>

                  <div className="fixture-card-meta">
                    <div className="meta-detail">
                      <Calendar size={16} />
                      <span>{formatDate(fix.date)} - {fix.time}</span>
                    </div>
                    <div className="meta-detail">
                      <MapPin size={16} />
                      <span>{fix.stadium}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredFixtures.length === 0 && (
              <div className="empty-fixtures">
                <p>Kriterlere uygun karşılaşma kaydı bulunmamaktadır.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .fixtures-page {
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
        
        /* Filters */
        .filters-panel {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 40px;
          padding: 20px 24px;
        }
        .tabs-container {
          display: flex;
          background: rgba(0,0,0,0.2);
          padding: 4px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .filter-tab-btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          color: rgba(255,255,255,0.7);
          transition: var(--transition-fast);
        }
        .filter-tab-btn:hover {
          color: white;
        }
        .filter-tab-btn.active {
          background: var(--primary-color);
          color: white;
        }
        
        .filter-controls {
          display: flex;
          gap: 16px;
          flex-grow: 0.5;
          justify-content: flex-end;
        }
        .search-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex-grow: 1;
          max-width: 300px;
        }
        :global(.filter-icon) {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,0.4);
        }
        .filter-input {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 10px 16px 10px 40px;
          font-size: 14px;
          color: white;
        }
        .filter-input:focus {
          border-color: var(--secondary-color);
        }
        .filter-select {
          background: rgba(0,0,0,0.2);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 10px 30px 10px 16px;
          font-size: 14px;
          color: white;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          background-size: 16px;
        }

        /* Fixtures Grid */
        .fixtures-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .fixture-card-full {
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .fixture-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
        }
        .fixture-league-tag {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--secondary-color);
          font-weight: 700;
          text-transform: uppercase;
        }
        .fixture-card-teams {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
        }
        .team-block {
          width: 40%;
        }
        .home-block {
          text-align: right;
        }
        .away-block {
          text-align: left;
        }
        .team-name-lg {
          font-size: 20px;
          font-weight: 800;
          color: white;
        }
        .fixture-center-block {
          width: 20%;
          display: flex;
          justify-content: center;
        }
        .score-display {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-size: 28px;
          font-weight: 900;
          color: white;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 6px 20px;
          border-radius: 8px;
        }
        .score-dash {
          color: var(--secondary-color);
        }
        .vs-badge-lg {
          font-size: 14px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.5);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 8px 16px;
          border-radius: 6px;
        }
        .fixture-card-meta {
          display: flex;
          justify-content: center;
          gap: 30px;
          font-size: 14px;
          color: rgba(255,255,255,0.5);
          border-top: 1px solid rgba(255,255,255,0.04);
          padding-top: 16px;
        }
        .meta-detail {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .empty-fixtures {
          text-align: center;
          padding: 40px 0;
          color: rgba(255,255,255,0.4);
        }
        .loading-state {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.5);
        }

        @media (max-width: 991px) {
          .filters-panel {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-controls {
            justify-content: space-between;
          }
          .search-wrapper {
            max-width: none;
          }
        }
        @media (max-width: 768px) {
          .team-name-lg {
            font-size: 16px;
          }
          .score-display {
            font-size: 20px;
            padding: 4px 12px;
          }
          .fixture-card-meta {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
        }
      `}</style>
    </section>
  );
}
