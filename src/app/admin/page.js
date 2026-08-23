'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Newspaper, Bell, Calendar, Image as ImageIcon, 
  Settings, LogOut, Plus, Edit, Trash2, Upload, X, ShieldAlert,
  Users, UserCheck, Trophy, Save, ArrowRight, MoreVertical
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'news', 'announcements', 'fixtures', 'gallery', 'sports', 'staff', 'management', 'settings'

  // Data states
  const [news, setNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [sports, setSports] = useState([]);
  const [staff, setStaff] = useState([]);
  const [management, setManagement] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});

  // Loading states for tabs
  const [dataLoading, setDataLoading] = useState(false);

  // Modal control states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'news', 'announcements', 'fixtures', 'gallery', 'sports', 'staff', 'management'
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [currentItem, setCurrentItem] = useState(null); // Item being edited
  const [actionSheet, setActionSheet] = useState(null);

  // Reusable Image Uploading states
  const [uploading, setUploading] = useState(false);

  // CRUD form states
  const [newsForm, setNewsForm] = useState({ title: '', content: '', summary: '', image_url: '', published_at: '', status: 'published' });
  const [annForm, setAnnForm] = useState({ title: '', content: '', published_at: '', importance: 'normal', status: 'published' });
  const [fixForm, setFixForm] = useState({ home_team: '', away_team: '', date: '', time: '', stadium: '', league: '', home_score: '', away_score: '', status: 'upcoming' });
  const [galForm, setGalForm] = useState({ title: '', description: '', image_url: '', category: '' });
  const [sportForm, setSportForm] = useState({ name: '', description: '', image_url: '', display_order: '0' });
  const [staffForm, setStaffForm] = useState({ name: '', role: '', biography: '', image_url: '', display_order: '0', status: 'active' });
  const [mgmtForm, setMgmtForm] = useState({ name: '', role: '', image_url: '', display_order: '0' });

  // 1. Auth Status check on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Unauthorized');
      })
      .then((data) => {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        setAuthChecking(false);
        loadAllData();
      })
      .catch(() => {
        setIsAuthenticated(false);
        setAuthChecking(false);
      });
  }, []);

  // 2. Load data helper
  const loadAllData = () => {
    setDataLoading(true);
    
    // Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSiteSettings(data));

    // Fetch news
    fetch('/api/news?status=all')
      .then((res) => res.json())
      .then((data) => setNews(data));

    // Fetch announcements
    fetch('/api/announcements?status=all')
      .then((res) => res.json())
      .then((data) => setAnnouncements(data));

    // Fetch fixtures
    fetch('/api/fixtures')
      .then((res) => res.json())
      .then((data) => setFixtures(data));

    // Fetch gallery
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => setGallery(data));

    // Fetch sports
    fetch('/api/sports')
      .then((res) => res.json())
      .then((data) => setSports(data));

    // Fetch staff
    fetch('/api/staff?status=all')
      .then((res) => res.json())
      .then((data) => setStaff(data));

    // Fetch management
    fetch('/api/management')
      .then((res) => res.json())
      .then((data) => {
        setManagement(data);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  };

  // 3. Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      setLoginError('Kullanıcı adı ve şifre gereklidir.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Giriş yapılamadı.');
      }

      setIsAuthenticated(true);
      setAdminUser({ username: data.username });
      loadAllData();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // 4. Logout handler
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setAdminUser(null);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // 5. Image upload helper
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Yükleme başarısız.');
      }
      
      // Update form field url
      if (type === 'news') setNewsForm({ ...newsForm, image_url: data.url });
      if (type === 'gallery') setGalForm({ ...galForm, image_url: data.url });
      if (type === 'sports') setSportForm({ ...sportForm, image_url: data.url });
      if (type === 'staff') setStaffForm({ ...staffForm, image_url: data.url });
      if (type === 'management') setMgmtForm({ ...mgmtForm, image_url: data.url });
      if (type === 'settings_logo') setSiteSettings({ ...siteSettings, logo_url: data.url });

    } catch (err) {
      alert('Yükleme hatası: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  // 6. Delete helper
  const handleDelete = async (id, type) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Silinemedi.');
      }
      // Reload details
      loadAllData();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  // 7. Settings Form Save
  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Güncellenemedi.');
      }
      alert('Site ayarları başarıyla kaydedildi. Değişikliklerin uygulanması için public sayfaları yenileyin.');
      loadAllData();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  // 8. Open Modals helper
  const openModal = (type, mode, item = null) => {
    setModalType(type);
    setModalMode(mode);
    setCurrentItem(item);
    setModalOpen(true);

    if (mode === 'edit' && item) {
      if (type === 'news') setNewsForm({ title: item.title, content: item.content, summary: item.summary, image_url: item.image_url, published_at: item.published_at, status: item.status });
      if (type === 'announcements') setAnnForm({ title: item.title, content: item.content, published_at: item.published_at, importance: item.importance, status: item.status });
      if (type === 'fixtures') setFixForm({ home_team: item.home_team, away_team: item.away_team, date: item.date, time: item.time, stadium: item.stadium, league: item.league, home_score: item.home_score ?? '', away_score: item.away_score ?? '', status: item.status });
      if (type === 'gallery') setGalForm({ title: item.title, description: item.description || '', image_url: item.image_url, category: item.category });
      if (type === 'sports') setSportForm({ name: item.name, description: item.description, image_url: item.image_url, display_order: String(item.display_order) });
      if (type === 'staff') setStaffForm({ name: item.name, role: item.role, biography: item.biography || '', image_url: item.image_url, display_order: String(item.display_order), status: item.status });
      if (type === 'management') setMgmtForm({ name: item.name, role: item.role, image_url: item.image_url, display_order: String(item.display_order) });
    } else {
      // Clear forms
      if (type === 'news') setNewsForm({ title: '', content: '', summary: '', image_url: '', published_at: new Date().toISOString().split('T')[0], status: 'published' });
      if (type === 'announcements') setAnnForm({ title: '', content: '', published_at: new Date().toISOString().split('T')[0], importance: 'normal', status: 'published' });
      if (type === 'fixtures') setFixForm({ home_team: '', away_team: '', date: '', time: '', stadium: '', league: '', home_score: '', away_score: '', status: 'upcoming' });
      if (type === 'gallery') setGalForm({ title: '', description: '', image_url: '', category: '' });
      if (type === 'sports') setSportForm({ name: '', description: '', image_url: '', display_order: '0' });
      if (type === 'staff') setStaffForm({ name: '', role: '', biography: '', image_url: '', display_order: '0', status: 'active' });
      if (type === 'management') setMgmtForm({ name: '', role: '', image_url: '', display_order: '0' });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentItem(null);
  };

  // 9. Save Form Submit handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let body = {};
    let endpoint = `/api/${modalType}`;
    let method = 'POST';

    if (modalType === 'news') body = newsForm;
    if (modalType === 'announcements') body = annForm;
    if (modalType === 'fixtures') body = fixForm;
    if (modalType === 'gallery') body = galForm;
    if (modalType === 'sports') body = sportForm;
    if (modalType === 'staff') body = staffForm;
    if (modalType === 'management') body = mgmtForm;

    if (modalMode === 'edit' && currentItem) {
      method = 'PUT';
      endpoint = `/api/${modalType}/${currentItem.id}`;
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Kaydedilemedi.');
      }
      closeModal();
      loadAllData();
    } catch (err) {
      alert('Hata: ' + err.message);
    }
  };

  if (authChecking) {
    return <div className="admin-loading">Kimlik doğrulanıyor...</div>;
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="login-screen-wrapper">
        <div className="login-card glass-panel">
          <div className="login-header">
            <ShieldAlert size={36} className="login-icon" />
            <h2>YÖNETİM PANELİ</h2>
            <p>Devam etmek için yetkili hesabı ile giriş yapın.</p>
          </div>

          {loginError && <div className="login-error-box">{loginError}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label className="form-label">Kullanıcı Adı</label>
              <input
                type="text"
                className="form-control"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Kullanıcı adı"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input
                type="password"
                className="form-control"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loginLoading} className="btn btn-primary login-btn">
              {loginLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        <style jsx>{`
          .login-screen-wrapper {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #0c0c0e;
            background-image: radial-gradient(circle at center, rgba(169,4,50,0.15) 0%, rgba(12,12,14,0.95) 100%);
          }
          .login-card {
            width: 90%;
            max-width: 440px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            border-color: rgba(253, 185, 18, 0.15);
          }
          .login-header {
            text-align: center;
            margin-bottom: 30px;
          }
          :global(.login-icon) {
            color: var(--secondary-color);
            margin-bottom: 12px;
          }
          .login-header h2 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
            color: white;
            margin-bottom: 8px;
          }
          .login-header p {
            font-size: 14px;
            color: rgba(255,255,255,0.6);
          }
          .login-error-box {
            background: rgba(220, 38, 38, 0.15);
            border: 1px solid rgba(220, 38, 38, 0.25);
            color: #f87171;
            padding: 12px;
            border-radius: 6px;
            font-size: 13px;
            margin-bottom: 20px;
            text-align: center;
          }
          .login-btn {
            width: 100%;
            margin-top: 15px;
          }
        `}</style>
      </div>
    );
  }

  // MAIN ADMIN LAYOUT
  const sidebarLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, id: 'dashboard' },
    { name: 'Haberler', icon: <Newspaper size={18} />, id: 'news' },
    { name: 'Duyurular', icon: <Bell size={18} />, id: 'announcements' },
    { name: 'Fikstür', icon: <Calendar size={18} />, id: 'fixtures' },
    { name: 'Galeri', icon: <ImageIcon size={18} />, id: 'gallery' },
    { name: 'Spor Branşları', icon: <Trophy size={18} />, id: 'sports' },
    { name: 'Teknik Heyet', icon: <Users size={18} />, id: 'staff' },
    { name: 'Yönetim', icon: <UserCheck size={18} />, id: 'management' },
    { name: 'Site Ayarları', icon: <Settings size={18} />, id: 'settings' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <ShieldAlert className="brand-icon" />
          <div className="brand-meta">
            <h3>CMS PANEL</h3>
            <span>{adminUser?.username || 'Admin'}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <button
              key={link.id}
              className={`sidebar-link ${activeTab === link.id ? 'active' : ''}`}
              onClick={() => setActiveTab(link.id)}
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
          
          <button className="sidebar-link sidebar-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </nav>
      </aside>

      {/* Main Panel */}
      <main className="admin-content">
        {dataLoading ? (
          <div className="admin-tab-loading">Veriler yükleniyor...</div>
        ) : (
          <>
            {/* TAB: DASHBOARD OVERVIEW */}
            {activeTab === 'dashboard' && (
              <div className="dashboard-view">
                <div className="admin-header">
                  <h1 className="admin-title">Özet Bilgiler</h1>
                  <span className="current-date-info">Hoş geldiniz, {adminUser?.username}</span>
                </div>

                <div className="dashboard-stats-grid">
                  <div className="stat-box" onClick={() => setActiveTab('news')}>
                    <Newspaper size={28} className="stat-icon" />
                    <div className="stat-info">
                      <h4>Toplam Haber</h4>
                      <span>{news.length}</span>
                    </div>
                  </div>
                  <div className="stat-box" onClick={() => setActiveTab('announcements')}>
                    <Bell size={28} className="stat-icon" />
                    <div className="stat-info">
                      <h4>Duyuru Sayısı</h4>
                      <span>{announcements.length}</span>
                    </div>
                  </div>
                  <div className="stat-box" onClick={() => setActiveTab('fixtures')}>
                    <Calendar size={28} className="stat-icon" />
                    <div className="stat-info">
                      <h4>Maç Sayısı</h4>
                      <span>{fixtures.length}</span>
                    </div>
                  </div>
                  <div className="stat-box" onClick={() => setActiveTab('gallery')}>
                    <ImageIcon size={28} className="stat-icon" />
                    <div className="stat-info">
                      <h4>Galeri Görseli</h4>
                      <span>{gallery.length}</span>
                    </div>
                  </div>
                </div>

                <div className="dashboard-quick-tables">
                  {/* Recent News */}
                  <div className="glass-panel recent-panel">
                    <h3>Son Eklenen Haberler</h3>
                    <div className="quick-list">
                      {news.slice(0, 3).map((item) => (
                        <div key={item.id} className="quick-list-item">
                          <span>{item.title}</span>
                          <span className={`badge ${item.status === 'published' ? 'badge-played' : 'badge-upcoming'}`}>
                            {item.status === 'published' ? 'Yayında' : 'Taslak'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Fixtures */}
                  <div className="glass-panel recent-panel">
                    <h3>Son Maç Programı</h3>
                    <div className="quick-list">
                      {fixtures.slice(0, 3).map((item) => (
                        <div key={item.id} className="quick-list-item">
                          <span>{item.home_team} vs {item.away_team}</span>
                          <span>{item.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: NEWS MANAGEMENT */}
            {activeTab === 'news' && (
              <div className="news-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Haber Yönetimi</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('news', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Haber Ekle</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Resim</th>
                        <th>Haber Başlığı</th>
                        <th>Yayın Tarihi</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.image_url} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                          </td>
                          <td style={{ fontWeight: '600' }}>{item.title}</td>
                          <td>{item.published_at}</td>
                          <td>
                            <span className={`badge ${item.status === 'published' ? 'badge-played' : 'badge-upcoming'}`}>
                              {item.status === 'published' ? 'Yayında' : 'Taslak'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions desktop-only">
                              <button className="admin-action-btn admin-action-edit" onClick={() => openModal('news', 'edit', item)}>Düzenle</button>
                              <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'news')}>Sil</button>
                            </div>
                            <div className="admin-actions-mobile mobile-only">
                              <button type="button" className="three-dots-btn" onClick={() => setActionSheet({ title: item.title, item, type: 'news' })}>
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ANNOUNCEMENTS MANAGEMENT */}
            {activeTab === 'announcements' && (
              <div className="announcements-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Duyuru Yönetimi</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('announcements', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Duyuru Ekle</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Duyuru Başlığı</th>
                        <th>Yayın Tarihi</th>
                        <th>Önem Derecesi</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {announcements.map((item) => (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '600' }}>{item.title}</td>
                          <td>{item.published_at}</td>
                          <td>
                            <span className={`badge ${item.importance === 'high' ? 'badge-high' : 'badge-normal'}`}>
                              {item.importance === 'high' ? 'Önemli' : 'Normal'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${item.status === 'published' ? 'badge-played' : 'badge-upcoming'}`}>
                              {item.status === 'published' ? 'Yayında' : 'Taslak'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions desktop-only">
                              <button className="admin-action-btn admin-action-edit" onClick={() => openModal('announcements', 'edit', item)}>Düzenle</button>
                              <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'announcements')}>Sil</button>
                            </div>
                            <div className="admin-actions-mobile mobile-only">
                              <button type="button" className="three-dots-btn" onClick={() => setActionSheet({ title: item.title, item, type: 'announcements' })}>
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: FIXTURES MANAGEMENT */}
            {activeTab === 'fixtures' && (
              <div className="fixtures-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Fikstür / Maç Yönetimi</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('fixtures', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Maç Ekle</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Lig/Kupa</th>
                        <th>Karşılaşma</th>
                        <th>Tarih & Saat</th>
                        <th>Stadyum</th>
                        <th>Skor / Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fixtures.map((item) => {
                        const isPlayed = item.status === 'played';
                        return (
                          <tr key={item.id}>
                            <td style={{ fontWeight: '600' }}>{item.league}</td>
                            <td>{item.home_team} vs {item.away_team}</td>
                            <td>{item.date} - {item.time}</td>
                            <td>{item.stadium}</td>
                            <td>
                              {isPlayed ? (
                                <strong style={{ color: 'var(--secondary-color)' }}>{item.home_score} - {item.away_score} (Oynandı)</strong>
                              ) : (
                                <span>Gelecek Maç</span>
                              )}
                            </td>
                            <td>
                              <div className="admin-actions desktop-only">
                                <button className="admin-action-btn admin-action-edit" onClick={() => openModal('fixtures', 'edit', item)}>Düzenle/Skor</button>
                                <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'fixtures')}>Sil</button>
                              </div>
                              <div className="admin-actions-mobile mobile-only">
                                <button type="button" className="three-dots-btn" onClick={() => setActionSheet({ title: `${item.home_team} vs ${item.away_team}`, item, type: 'fixtures' })}>
                                  <MoreVertical size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: GALLERY MANAGEMENT */}
            {activeTab === 'gallery' && (
              <div className="gallery-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Galeri Görselleri</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('gallery', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Görsel Yükle</span>
                  </button>
                </div>

                <div className="admin-gallery-grid">
                  {gallery.map((item) => (
                    <div key={item.id} className="admin-gal-card glass-panel">
                      <div className="admin-gal-img-wrapper">
                        <img src={item.image_url} alt="" />
                      </div>
                      <div className="admin-gal-info">
                        <h4>{item.title}</h4>
                        <span className="badge badge-normal">{item.category}</span>
                      </div>
                      <div className="admin-gal-actions">
                        <button className="admin-action-btn admin-action-edit" onClick={() => openModal('gallery', 'edit', item)}>Düzenle</button>
                        <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'gallery')}>Sil</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SPORTS BRANCHES */}
            {activeTab === 'sports' && (
              <div className="sports-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Spor Branşları</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('sports', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Branş Ekle</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Görsel</th>
                        <th>Branş Adı</th>
                        <th>Açıklama</th>
                        <th>Sıra</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sports.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.image_url} alt="" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                          </td>
                          <td style={{ fontWeight: '600' }}>{item.name}</td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</td>
                          <td>{item.display_order}</td>
                          <td>
                            <div className="admin-actions desktop-only">
                              <button className="admin-action-btn admin-action-edit" onClick={() => openModal('sports', 'edit', item)}>Düzenle</button>
                              <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'sports')}>Sil</button>
                            </div>
                            <div className="admin-actions-mobile mobile-only">
                              <button type="button" className="three-dots-btn" onClick={() => setActionSheet({ title: item.name, item, type: 'sports' })}>
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: TECHNICAL STAFF */}
            {activeTab === 'staff' && (
              <div className="staff-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Teknik Kadro</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('staff', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Personel Ekle</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fotoğraf</th>
                        <th>Ad Soyad</th>
                        <th>Görevi</th>
                        <th>Sıra</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.image_url} alt="" style={{ width: '55px', height: '55px', borderRadius: '8px', objectFit: 'cover' }} />
                          </td>
                          <td style={{ fontWeight: '600' }}>{item.name}</td>
                          <td>{item.role}</td>
                          <td>{item.display_order}</td>
                          <td>
                            <span className={`badge ${item.status === 'active' ? 'badge-played' : 'badge-upcoming'}`}>
                              {item.status === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td>
                            <div className="admin-actions desktop-only">
                              <button className="admin-action-btn admin-action-edit" onClick={() => openModal('staff', 'edit', item)}>Düzenle</button>
                              <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'staff')}>Sil</button>
                            </div>
                            <div className="admin-actions-mobile mobile-only">
                              <button type="button" className="three-dots-btn" onClick={() => setActionSheet({ title: item.name, item, type: 'staff' })}>
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: MANAGEMENT BOARD */}
            {activeTab === 'management' && (
              <div className="mgmt-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Yönetim Kurulu</h1>
                  <button className="btn btn-primary btn-sm" onClick={() => openModal('management', 'add')}>
                    <Plus size={16} />
                    <span>Yeni Yönetici Ekle</span>
                  </button>
                </div>

                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Fotoğraf</th>
                        <th>Ad Soyad</th>
                        <th>Görev / Unvan</th>
                        <th>Sıra</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {management.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img src={item.image_url} alt="" style={{ width: '55px', height: '55px', borderRadius: '8px', objectFit: 'cover' }} />
                          </td>
                          <td style={{ fontWeight: '600' }}>{item.name}</td>
                          <td>{item.role}</td>
                          <td>{item.display_order}</td>
                          <td>
                            <div className="admin-actions desktop-only">
                              <button className="admin-action-btn admin-action-edit" onClick={() => openModal('management', 'edit', item)}>Düzenle</button>
                              <button className="admin-action-btn admin-action-delete" onClick={() => handleDelete(item.id, 'management')}>Sil</button>
                            </div>
                            <div className="admin-actions-mobile mobile-only">
                              <button type="button" className="three-dots-btn" onClick={() => setActionSheet({ title: item.name, item, type: 'management' })}>
                                <MoreVertical size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SITE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="settings-management-view">
                <div className="admin-header">
                  <h1 className="admin-title">Site Ayarları</h1>
                </div>

                <form onSubmit={handleSettingsSave} className="glass-panel settings-form">
                  <div className="settings-grid">
                    
                    {/* General Settings */}
                    <div className="settings-section">
                      <h3>Genel Bilgiler</h3>
                      <div className="form-group">
                        <label className="form-label">Kulüp Adı</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.club_name || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, club_name: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Kulüp Logosu</label>
                        <div className="logo-upload-preview">
                          {siteSettings.logo_url && (
                            <img src={siteSettings.logo_url} alt="Logo" className="logo-preview-img" />
                          )}
                          <div className="upload-input-btn">
                            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                              <Upload size={14} />
                              <span>{uploading ? 'Yükleniyor...' : 'Logo Yükle'}</span>
                              <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(e) => handleImageUpload(e, 'settings_logo')}
                                accept="image/*"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Settings */}
                    <div className="settings-section">
                      <h3>İletişim Bilgileri</h3>
                      <div className="form-group">
                        <label className="form-label">Telefon</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.phone || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">E-posta</label>
                        <input
                          type="email"
                          className="form-control"
                          value={siteSettings.email || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">WhatsApp Numarası (Ülke koduyla, örn: 905051905190)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.whatsapp || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Adres</label>
                        <textarea
                          className="form-control"
                          value={siteSettings.address || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Color Settings */}
                    <div className="settings-section">
                      <h3>Tasarım ve Renkler</h3>
                      <div className="color-inputs-grid">
                        <div className="form-group color-group">
                          <label className="form-label">Ana Renk (Primary)</label>
                          <div className="color-picker-wrapper">
                            <input
                              type="color"
                              value={siteSettings.primary_color || '#A90432'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, primary_color: e.target.value })}
                            />
                            <input
                              type="text"
                              className="form-control"
                              value={siteSettings.primary_color || '#A90432'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, primary_color: e.target.value })}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group color-group">
                          <label className="form-label">Yardımcı Renk (Secondary)</label>
                          <div className="color-picker-wrapper">
                            <input
                              type="color"
                              value={siteSettings.secondary_color || '#FDB912'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, secondary_color: e.target.value })}
                            />
                            <input
                              type="text"
                              className="form-control"
                              value={siteSettings.secondary_color || '#FDB912'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, secondary_color: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="form-group color-group">
                          <label className="form-label">Arka Plan (Background)</label>
                          <div className="color-picker-wrapper">
                            <input
                              type="color"
                              value={siteSettings.bg_color || '#0f0f11'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, bg_color: e.target.value })}
                            />
                            <input
                              type="text"
                              className="form-control"
                              value={siteSettings.bg_color || '#0f0f11'}
                              onChange={(e) => setSiteSettings({ ...siteSettings, bg_color: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Settings */}
                    <div className="settings-section">
                      <h3>Sosyal Medya Bağlantıları</h3>
                      <div className="form-group">
                        <label className="form-label">Instagram Linki</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.instagram || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Facebook Linki</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.facebook || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, facebook: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Twitter / X Linki</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.twitter || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, twitter: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">YouTube Linki</label>
                        <input
                          type="text"
                          className="form-control"
                          value={siteSettings.youtube || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, youtube: e.target.value })}
                        />
                      </div>
                    </div>

                  </div>

                  <button type="submit" className="btn btn-primary settings-submit-btn">
                    <Save size={16} />
                    <span>Değişiklikleri Kaydet</span>
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* CRUD MODAL EDITORS */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {modalMode === 'add' ? 'Yeni Ekle' : 'Düzenle'} - {
                  modalType === 'news' ? 'Haber' :
                  modalType === 'announcements' ? 'Duyuru' :
                  modalType === 'fixtures' ? 'Maç/Fikstür' :
                  modalType === 'gallery' ? 'Görsel' :
                  modalType === 'sports' ? 'Spor Branşı' :
                  modalType === 'staff' ? 'Teknik Personel' :
                  modalType === 'management' ? 'Yönetici' : ''
                }
              </h3>
              <button className="modal-close" onClick={closeModal}><X /></button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                
                {/* News Form Fields */}
                {modalType === 'news' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Haber Başlığı *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newsForm.title}
                        onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kısa Özet *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={newsForm.summary}
                        onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Haber Görseli *</label>
                      <div className="image-upload-row">
                        <input
                          type="text"
                          className="form-control"
                          value={newsForm.image_url}
                          onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                          placeholder="/uploads/resim.jpg"
                          required
                        />
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} />
                          <span>Yükle</span>
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'news')} accept="image/*" />
                        </label>
                      </div>
                      {newsForm.image_url && <img src={newsForm.image_url} alt="" className="modal-preview-img" />}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yayın Tarihi *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={newsForm.published_at}
                        onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Haber Detay İçeriği *</label>
                      <textarea
                        className="form-control"
                        value={newsForm.content}
                        onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yayın Durumu</label>
                      <select
                        className="form-control"
                        value={newsForm.status}
                        onChange={(e) => setNewsForm({ ...newsForm, status: e.target.value })}
                      >
                        <option value="published">Yayında</option>
                        <option value="draft">Taslak</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Announcements Form Fields */}
                {modalType === 'announcements' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Duyuru Başlığı *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={annForm.title}
                        onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yayın Tarihi *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={annForm.published_at}
                        onChange={(e) => setAnnForm({ ...annForm, published_at: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Önem Derecesi</label>
                      <select
                        className="form-control"
                        value={annForm.importance}
                        onChange={(e) => setAnnForm({ ...annForm, importance: e.target.value })}
                      >
                        <option value="normal">Normal</option>
                        <option value="high">Önemli (Kırmızı Etiketli)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duyuru İçeriği *</label>
                      <textarea
                        className="form-control"
                        value={annForm.content}
                        onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Yayın Durumu</label>
                      <select
                        className="form-control"
                        value={annForm.status}
                        onChange={(e) => setAnnForm({ ...annForm, status: e.target.value })}
                      >
                        <option value="published">Yayında</option>
                        <option value="draft">Taslak</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Fixtures Form Fields */}
                {modalType === 'fixtures' && (
                  <>
                    <div className="grid-2" style={{ gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Ev Sahibi Takım *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={fixForm.home_team}
                          onChange={(e) => setFixForm({ ...fixForm, home_team: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Deplasman Takım *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={fixForm.away_team}
                          onChange={(e) => setFixForm({ ...fixForm, away_team: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Maç Tarihi *</label>
                        <input
                          type="date"
                          className="form-control"
                          value={fixForm.date}
                          onChange={(e) => setFixForm({ ...fixForm, date: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Maç Saati *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={fixForm.time}
                          placeholder="19:00"
                          onChange={(e) => setFixForm({ ...fixForm, time: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Stadyum *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={fixForm.stadium}
                          onChange={(e) => setFixForm({ ...fixForm, stadium: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Lig / Organizasyon *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={fixForm.league}
                          placeholder="Süper Lig"
                          onChange={(e) => setFixForm({ ...fixForm, league: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Maç Durumu</label>
                      <select
                        className="form-control"
                        value={fixForm.status}
                        onChange={(e) => setFixForm({ ...fixForm, status: e.target.value })}
                      >
                        <option value="upcoming">Gelecek Maç (Yaklaşan)</option>
                        <option value="played">Oynandı (Sonuçlu)</option>
                      </select>
                    </div>

                    {fixForm.status === 'played' && (
                      <div className="grid-2" style={{ gap: '15px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '6px' }}>
                        <div className="form-group">
                          <label className="form-label">Ev Sahibi Skor</label>
                          <input
                            type="number"
                            className="form-control"
                            value={fixForm.home_score}
                            onChange={(e) => setFixForm({ ...fixForm, home_score: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Deplasman Skor</label>
                          <input
                            type="number"
                            className="form-control"
                            value={fixForm.away_score}
                            onChange={(e) => setFixForm({ ...fixForm, away_score: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Gallery Form Fields */}
                {modalType === 'gallery' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Görsel Başlığı *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={galForm.title}
                        onChange={(e) => setGalForm({ ...galForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Açıklama</label>
                      <input
                        type="text"
                        className="form-control"
                        value={galForm.description}
                        onChange={(e) => setGalForm({ ...galForm, description: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kategori / Albüm *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={galForm.category}
                        placeholder="Futbol, Antrenman, Taraftar vb."
                        onChange={(e) => setGalForm({ ...galForm, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Görsel *</label>
                      <div className="image-upload-row">
                        <input
                          type="text"
                          className="form-control"
                          value={galForm.image_url}
                          onChange={(e) => setGalForm({ ...galForm, image_url: e.target.value })}
                          placeholder="/uploads/foto.jpg"
                          required
                        />
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} />
                          <span>Yükle</span>
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'gallery')} accept="image/*" />
                        </label>
                      </div>
                      {galForm.image_url && <img src={galForm.image_url} alt="" className="modal-preview-img" />}
                    </div>
                  </>
                )}

                {/* Sports Form Fields */}
                {modalType === 'sports' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Branş Adı *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={sportForm.name}
                        onChange={(e) => setSportForm({ ...sportForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Görsel / Simge *</label>
                      <div className="image-upload-row">
                        <input
                          type="text"
                          className="form-control"
                          value={sportForm.image_url}
                          onChange={(e) => setSportForm({ ...sportForm, image_url: e.target.value })}
                          placeholder="/uploads/futbol.jpg"
                          required
                        />
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} />
                          <span>Yükle</span>
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'sports')} accept="image/*" />
                        </label>
                      </div>
                      {sportForm.image_url && <img src={sportForm.image_url} alt="" className="modal-preview-img" />}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sıralama (Display Order)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={sportForm.display_order}
                        onChange={(e) => setSportForm({ ...sportForm, display_order: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kısa Açıklama *</label>
                      <textarea
                        className="form-control"
                        value={sportForm.description}
                        onChange={(e) => setSportForm({ ...sportForm, description: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

                {/* Technical Staff Form Fields */}
                {modalType === 'staff' && (
                  <>
                    <div className="grid-2" style={{ gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Ad Soyad *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={staffForm.name}
                          onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Görev / Rol *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={staffForm.role}
                          placeholder="Teknik Direktör"
                          onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fotoğraf *</label>
                      <div className="image-upload-row">
                        <input
                          type="text"
                          className="form-control"
                          value={staffForm.image_url}
                          onChange={(e) => setStaffForm({ ...staffForm, image_url: e.target.value })}
                          placeholder="/uploads/staff.jpg"
                          required
                        />
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} />
                          <span>Yükle</span>
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'staff')} accept="image/*" />
                        </label>
                      </div>
                      {staffForm.image_url && <img src={staffForm.image_url} alt="" className="modal-preview-img" />}
                    </div>

                    <div className="grid-2" style={{ gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Sıralama (Display Order)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={staffForm.display_order}
                          onChange={(e) => setStaffForm({ ...staffForm, display_order: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Durum</label>
                        <select
                          className="form-control"
                          value={staffForm.status}
                          onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                        >
                          <option value="active">Aktif</option>
                          <option value="passive">Pasif (Gizli)</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kısa Biyografi</label>
                      <textarea
                        className="form-control"
                        value={staffForm.biography}
                        onChange={(e) => setStaffForm({ ...staffForm, biography: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Management Form Fields */}
                {modalType === 'management' && (
                  <>
                    <div className="grid-2" style={{ gap: '15px' }}>
                      <div className="form-group">
                        <label className="form-label">Ad Soyad *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={mgmtForm.name}
                          onChange={(e) => setMgmtForm({ ...mgmtForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Görev / Unvan *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={mgmtForm.role}
                          placeholder="Başkan"
                          onChange={(e) => setMgmtForm({ ...mgmtForm, role: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fotoğraf *</label>
                      <div className="image-upload-row">
                        <input
                          type="text"
                          className="form-control"
                          value={mgmtForm.image_url}
                          onChange={(e) => setMgmtForm({ ...mgmtForm, image_url: e.target.value })}
                          placeholder="/uploads/president.jpg"
                          required
                        />
                        <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                          <Upload size={14} />
                          <span>Yükle</span>
                          <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, 'management')} accept="image/*" />
                        </label>
                      </div>
                      {mgmtForm.image_url && <img src={mgmtForm.image_url} alt="" className="modal-preview-img" />}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Sıralama (Display Order)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={mgmtForm.display_order}
                        onChange={(e) => setMgmtForm({ ...mgmtForm, display_order: e.target.value })}
                      />
                    </div>
                  </>
                )}

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={closeModal}>Vazgeç</button>
                <button type="submit" className="btn btn-primary btn-sm">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE ACTION SHEET */}
      {actionSheet && (
        <div className="action-sheet-overlay" onClick={() => setActionSheet(null)}>
          <div className="action-sheet-content" onClick={(e) => e.stopPropagation()}>
            <div className="action-sheet-header">
              <h3>{actionSheet.title}</h3>
              <p>Gerçekleştirmek istediğiniz işlemi seçin.</p>
            </div>
            <div className="action-sheet-body">
              <button 
                type="button"
                className="action-sheet-btn action-sheet-edit"
                onClick={() => {
                  openModal(actionSheet.type, 'edit', actionSheet.item);
                  setActionSheet(null);
                }}
              >
                <Edit size={18} />
                <span>Düzenle</span>
              </button>
              <button 
                type="button"
                className="action-sheet-btn action-sheet-delete"
                onClick={() => {
                  handleDelete(actionSheet.item.id, actionSheet.type);
                  setActionSheet(null);
                }}
              >
                <Trash2 size={18} />
                <span>Sil</span>
              </button>
              <button type="button" className="action-sheet-btn action-sheet-cancel" onClick={() => setActionSheet(null)}>
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-loading {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f0f11;
          color: white;
          font-size: 18px;
          font-weight: 600;
        }
        
        /* Sidebar styling */
        .admin-sidebar {
          width: 260px;
          background: #141416;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .sidebar-brand {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        :global(.brand-icon) {
          color: var(--secondary-color);
        }
        .brand-meta h3 {
          font-size: 16px;
          font-weight: 800;
          color: white;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .brand-meta span {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }
        .sidebar-nav {
          padding: 20px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-grow: 1;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: var(--transition-fast);
          text-align: left;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.02);
          color: white;
        }
        .sidebar-link.active {
          background: var(--primary-color);
          color: white;
        }
        .sidebar-logout-btn {
          margin-top: auto;
          color: #f87171;
          background: rgba(239, 68, 68, 0.05);
        }
        .sidebar-logout-btn:hover {
          background: #dc2626;
          color: white;
        }

        /* Dashboard View stats styles */
        .current-date-info {
          font-size: 14px;
          color: rgba(255,255,255,0.4);
        }
        .dashboard-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-box {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px;
          border-radius: var(--border-radius);
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .stat-box:hover {
          background: rgba(255,255,255,0.04);
          transform: translateY(-2px);
          border-color: var(--secondary-color);
        }
        :global(.stat-icon) {
          color: var(--secondary-color);
        }
        .stat-info h4 {
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .stat-info span {
          font-size: 26px;
          font-weight: 800;
          color: white;
        }
        .dashboard-quick-tables {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
        }
        .recent-panel h3 {
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 20px;
        }
        .quick-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .quick-list-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 6px;
          font-size: 14px;
        }

        /* Image uploads elements */
        .image-upload-row {
          display: flex;
          gap: 12px;
        }
        .modal-preview-img {
          width: 100%;
          max-height: 150px;
          object-fit: cover;
          border-radius: 6px;
          margin-top: 10px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .admin-tab-loading {
          text-align: center;
          padding: 40px;
          color: rgba(255,255,255,0.4);
        }

        /* Gallery tab */
        .admin-gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .admin-gal-card {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .admin-gal-img-wrapper {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 6px;
          overflow: hidden;
          background: #000;
        }
        .admin-gal-img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .admin-gal-info h4 {
          font-size: 15px;
          font-weight: 700;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-gal-actions {
          display: flex;
          justify-content: space-between;
          margin-top: auto;
        }

        /* Settings View */
        .settings-form {
          padding: 30px;
        }
        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px 40px;
          margin-bottom: 30px;
        }
        .settings-section h3 {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 8px;
        }
        .logo-upload-preview {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .logo-preview-img {
          height: 50px;
          width: auto;
          object-fit: contain;
        }
        .color-picker-wrapper {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .color-picker-wrapper input[type="color"] {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          background: none;
          padding: 0;
        }
        .settings-submit-btn {
          padding: 14px 30px;
        }

        /* Three dots and desktop/mobile visibility helpers */
        .desktop-only {
          display: flex !important;
        }
        .mobile-only {
          display: none !important;
        }
        .three-dots-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .three-dots-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
          border-color: var(--secondary-color);
        }

        /* Mobile Action Sheet (Bottom Sheet overlay) */
        .action-sheet-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0,0,0,0.6);
          z-index: 10000;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          backdrop-filter: blur(4px);
        }
        .action-sheet-content {
          width: 100%;
          max-width: 480px;
          background: #141416;
          border-top: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px 16px 0 0;
          padding: 24px 20px 30px 20px;
          animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 -10px 30px rgba(0,0,0,0.5);
        }
        .action-sheet-header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 12px;
        }
        .action-sheet-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .action-sheet-header p {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
        }
        .action-sheet-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .action-sheet-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .action-sheet-edit {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.2);
        }
        .action-sheet-edit:hover {
          background: rgba(245, 158, 11, 0.2);
        }
        .action-sheet-delete {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .action-sheet-delete:hover {
          background: rgba(239, 68, 68, 0.2);
        }
        .action-sheet-cancel {
          background: rgba(255,255,255,0.05);
          color: white;
          border: 1px solid rgba(255,255,255,0.08);
          margin-top: 4px;
        }
        .action-sheet-cancel:hover {
          background: rgba(255,255,255,0.1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @media (max-width: 1199px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .dashboard-quick-tables {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 991px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.05);
          }
          .sidebar-brand {
            padding: 16px 20px;
          }
          .sidebar-nav {
            flex-direction: row;
            overflow-x: auto;
            padding: 12px;
            gap: 8px;
            scrollbar-width: none;
          }
          .sidebar-nav::-webkit-scrollbar {
            display: none;
          }
          .sidebar-link {
            padding: 10px 16px;
            font-size: 13px;
            white-space: nowrap;
            border-radius: 20px;
            background: rgba(255,255,255,0.03);
          }
          .sidebar-logout-btn {
            margin-top: 0;
            background: rgba(239, 68, 68, 0.1) !important;
          }
          .admin-content {
            padding: 20px;
          }
        }
        @media (max-width: 767px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: flex !important;
          }
          
          .admin-content {
            padding: 16px;
          }
          .admin-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            margin-bottom: 20px;
          }
          .admin-header .btn {
            width: 100%;
            padding: 12px;
          }
          .admin-title {
            font-size: 20px;
            text-align: center;
          }
          .dashboard-stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .stat-box {
            padding: 16px;
          }
          .stat-info span {
            font-size: 22px;
          }

          /* Keep original table look on mobile but allow scrolling */
          .admin-table-container {
            overflow-x: auto !important;
            scrollbar-width: thin;
            background: var(--accent-color);
            border: 1px solid var(--card-border);
            border-radius: var(--border-radius);
            margin-top: 15px;
          }
          
          /* Prevent overflow-wrap from breaking layout */
          .admin-table th, .admin-table td {
            white-space: nowrap;
            padding: 12px 14px !important;
          }

          /* Modal Responsive Overlay (Full Screen Bottom Sheet) */
          :global(.modal-content) {
            width: 100% !important;
            height: 100% !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
            border: none !important;
          }
          :global(.modal-body) {
            overflow-y: auto !important;
            flex-grow: 1 !important;
            padding: 16px !important;
          }
          :global(.modal-header) {
            padding: 16px !important;
          }
          :global(.modal-footer) {
            padding: 16px !important;
            position: sticky;
            bottom: 0;
            background: #18181b;
            border-top: 1px solid rgba(255,255,255,0.05);
            z-index: 10;
          }
          :global(.grid-2) {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          
          .settings-form {
            padding: 16px;
          }
          .settings-grid {
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}
