const sqlite3 = require('sqlite3');
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.resolve(__dirname, '../club.db');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database for seeding.');
});

db.serialize(async () => {
  console.log('Creating tables...');

  // 1. Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL
  )`);

  // 2. News Table
  db.run(`CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    summary TEXT NOT NULL,
    image_url TEXT NOT NULL,
    published_at TEXT NOT NULL,
    status TEXT DEFAULT 'published'
  )`);

  // 3. Announcements Table
  db.run(`CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TEXT NOT NULL,
    importance TEXT DEFAULT 'normal',
    status TEXT DEFAULT 'published'
  )`);

  // 4. Fixtures Table
  db.run(`CREATE TABLE IF NOT EXISTS fixtures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    stadium TEXT NOT NULL,
    league TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT DEFAULT 'upcoming'
  )`);

  // 5. Gallery Table
  db.run(`CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL
  )`);

  // 6. Sports Table
  db.run(`CREATE TABLE IF NOT EXISTS sports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
  )`);

  // 7. Technical Staff Table
  db.run(`CREATE TABLE IF NOT EXISTS technical_staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    biography TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active'
  )`);

  // 8. Management Table
  db.run(`CREATE TABLE IF NOT EXISTS management (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
  )`);

  // 9. Site Settings Table
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);

  console.log('Seeding initial data...');

  // Default Admin User (username: admin, password: admin123)
  const adminCreds = hashPassword('admin123');
  db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, salt) VALUES (1, 'admin', ?, ?)`, [
    adminCreds.hash,
    adminCreds.salt
  ]);

  // Default Site Settings
  const settings = [
    ['club_name', 'Galata Spor Kulübü'],
    ['logo_url', '/uploads/logo.png'],
    ['phone', '+90 212 305 1905'],
    ['email', 'info@galatasporkulubu.org.tr'],
    ['whatsapp', '905051905190'],
    ['address', 'Battalgazi, Malatya'],
    ['instagram', 'https://instagram.com/galatasaray'],
    ['facebook', 'https://facebook.com/galatasaray'],
    ['twitter', 'https://twitter.com/galatasaray'],
    ['youtube', 'https://youtube.com/galatasaray'],
    ['primary_color', '#A90432'], // Galata Red
    ['secondary_color', '#FDB912'], // Galata Yellow Gold
    ['bg_color', '#0f0f11'], // Dark background
    ['text_color', '#ffffff'], // White text
    ['accent_color', '#1c1c1f'] // Zinc Accent
  ];

  const stmtSettings = db.prepare(`INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`);
  settings.forEach(([k, v]) => stmtSettings.run(k, v));
  stmtSettings.finalize();

  // News Seed — CLEAR existing and insert only the opening news
  db.run(`DELETE FROM news`);
  const newsItems = [
    [
      'Sitemiz Açılmıştır!',
      'sitemiz-acilmistir',
      'Galata Spor Kulübü Malatya olarak, kulübümüzü daha geniş kitlelere tanıtmak ve taraftarlarımızla daha etkin iletişim kurabilmek amacıyla resmi web sitemizi hayata geçirmiş bulunmaktayız. Sitemiz aracılığıyla haberler, duyurular, fikstür bilgileri, spor branşlarımız ve kulüp kadromuz hakkında güncel bilgilere kolayca ulaşabileceksiniz. Bizi takip etmeye devam edin, nice başarılara birlikte!',
      'Galata Spor Kulübü Malatya resmi web sitesi açılmıştır. Haberler, duyurular ve tüm güncel bilgiler için takipte kalın!',
      '/uploads/logo.png',
      '2026-08-23'
    ]
  ];

  const stmtNews = db.prepare(`INSERT OR IGNORE INTO news (title, slug, content, summary, image_url, published_at, status) VALUES (?, ?, ?, ?, ?, ?, 'published')`);
  newsItems.forEach(item => stmtNews.run(item));
  stmtNews.finalize();

  // Announcements Seed
  const announcements = [
    [
      'Web Sitemiz Hizmete Girdi',
      'Galata Spor Kulübü Malatya resmi web sitesi açılmıştır. Artık haberler, duyurular, fikstür ve branş bilgileri için sitemizi ziyaret edebilirsiniz.',
      '2026-08-23',
      'high'
    ]
  ];

  db.run(`DELETE FROM announcements`);
  const stmtAnn = db.prepare(`INSERT OR IGNORE INTO announcements (title, content, published_at, importance, status) VALUES (?, ?, ?, ?, 'published')`);
  announcements.forEach(item => stmtAnn.run(item));
  stmtAnn.finalize();

  // Fixtures Seed — CLEAR existing and add only Galata vs Fenerbahçe
  db.run(`DELETE FROM fixtures`);
  const fixtures = [
    ['Galata Spor', 'Fenerbahçe', '2026-09-15', '19:00', 'Malatya Stadyumu', 'Bölgesel Amatör Lig', null, null, 'upcoming']
  ];

  const stmtFix = db.prepare(`INSERT OR IGNORE INTO fixtures (home_team, away_team, date, time, stadium, league, home_score, away_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  fixtures.forEach(item => stmtFix.run(item));
  stmtFix.finalize();

  // Gallery Seed
  const gallery = [
    ['Kulüp Logosu', 'Galata Spor Kulübü Malatya resmi amblemi', '/uploads/logo.png', 'Kulüp']
  ];

  db.run(`DELETE FROM gallery`);
  const stmtGal = db.prepare(`INSERT OR IGNORE INTO gallery (title, description, image_url, category) VALUES (?, ?, ?, ?)`);
  gallery.forEach(item => stmtGal.run(item));
  stmtGal.finalize();

  // Sports Branches Seed
  const sports = [
    ['Futbol', 'Milyonları peşinden sürükleyen, şanlı tarihimizin lokomotif branşı.', '/uploads/logo.png', 1],
    ['Basketbol', 'Yenilmez ruhla parkede mücadele eden erkek ve kadın takımlarımız.', '/uploads/logo.png', 2],
    ['Voleybol', 'Avrupa kupalarında ses getiren, filenin aslanları ve sultanları.', '/uploads/logo.png', 3],
    ['Espor', 'Dijital arenalarda şampiyonluk kovalayan en yeni ve dinamik branşımız.', '/uploads/logo.png', 4]
  ];

  const stmtSports = db.prepare(`INSERT OR IGNORE INTO sports (name, description, image_url, display_order) VALUES (?, ?, ?, ?)`);
  sports.forEach(item => stmtSports.run(item));
  stmtSports.finalize();

  // Technical Staff Seed — CLEAR and insert only Alper Kaymaz
  db.run(`DELETE FROM technical_staff`);
  const staff = [
    ['Alper Kaymaz', 'Teknik Direktör', 'Galata Spor Kulübü Malatya teknik direktörü.', '/uploads/alper_kaymaz.jpg', 1]
  ];

  const stmtStaff = db.prepare(`INSERT OR IGNORE INTO technical_staff (name, role, biography, image_url, display_order, status) VALUES (?, ?, ?, ?, ?, 'active')`);
  staff.forEach(item => stmtStaff.run(item));
  stmtStaff.finalize();

  // Management Seed — CLEAR and insert only Alper Kaymaz
  db.run(`DELETE FROM management`);
  const management = [
    ['Alper Kaymaz', 'Kulüp Başkanı', '/uploads/alper_kaymaz.jpg', 1]
  ];

  const stmtMgmt = db.prepare(`INSERT OR IGNORE INTO management (name, role, image_url, display_order) VALUES (?, ?, ?, ?)`);
  management.forEach(item => stmtMgmt.run(item));
  stmtMgmt.finalize();

  console.log('Seeding completed successfully!');
  db.close();
});
