import sqlite3 from 'sqlite3';
import path from 'path';
import crypto from 'crypto';

// Path to our SQLite database file in the project root
const DB_PATH = path.resolve(process.cwd(), 'club.db');

class Database {
  constructor() {
    const mode = process.env.VERCEL
      ? sqlite3.OPEN_READONLY
      : (sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

    this.connectionError = null;

    this.db = new sqlite3.Database(DB_PATH, mode, (err) => {
      if (err) {
        console.error('Could not connect to database', err);
        this.connectionError = err;
      } else {
        console.log('Connected to SQLite database at:', DB_PATH, process.env.VERCEL ? '(READ-ONLY)' : '');
        if (!process.env.VERCEL) {
          this.autoInitialize();
        }
      }
    });
  }

  // Auto initialize schema if missing
  autoInitialize() {
    if (global.dbInitialized) {
      return;
    }
    global.dbInitialized = true;

    this.db.serialize(() => {
      // Check if users table exists
      this.db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
        if (err) {
          console.error('Error checking schema:', err);
          return;
        }
        if (!row) {
          console.log('Tables do not exist. Automatically initializing database tables and seeding default data...');
          this.createTablesAndSeed();
        }
      });
    });
  }

  createTablesAndSeed() {
    // 1. Users Table
    this.db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL
    )`);

    // 2. News Table
    this.db.run(`CREATE TABLE IF NOT EXISTS news (
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
    this.db.run(`CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      published_at TEXT NOT NULL,
      importance TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'published'
    )`);

    // 4. Fixtures Table
    this.db.run(`CREATE TABLE IF NOT EXISTS fixtures (
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
    this.db.run(`CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      category TEXT NOT NULL
    )`);

    // 6. Sports Table
    this.db.run(`CREATE TABLE IF NOT EXISTS sports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    )`);

    // 7. Technical Staff Table
    this.db.run(`CREATE TABLE IF NOT EXISTS technical_staff (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      biography TEXT,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active'
    )`);

    // 8. Management Table
    this.db.run(`CREATE TABLE IF NOT EXISTS management (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      image_url TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    )`);

    // 9. Site Settings Table
    this.db.run(`CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

    // Seed data
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync('admin123', salt, 1000, 64, 'sha512').toString('hex');
    
    this.db.run(`INSERT OR IGNORE INTO users (id, username, password_hash, salt) VALUES (1, 'admin', ?, ?)`, [hash, salt]);

    // Seed Settings
    const settings = [
      ['club_name', 'Galata Spor Kulübü'],
      ['logo_url', '/uploads/logo.png'],
      ['phone', '+90 212 305 1905'],
      ['email', 'info@galatasporkulubu.org.tr'],
      ['whatsapp', '905051905190'],
      ['address', 'Nef Stadyumu, Huzur Mh., Seyrantepe, Sarıyer, İstanbul'],
      ['instagram', 'https://instagram.com/galatasaray'],
      ['facebook', 'https://facebook.com/galatasaray'],
      ['twitter', 'https://twitter.com/galatasaray'],
      ['youtube', 'https://youtube.com/galatasaray'],
      ['primary_color', '#A90432'], // Galatasaray Red
      ['secondary_color', '#FDB912'], // Galatasaray Yellow Gold
      ['bg_color', '#0f0f11'], // Dark background
      ['text_color', '#ffffff'], // White text
      ['accent_color', '#1c1c1f'] // Zinc Accent
    ];

    const stmtSettings = this.db.prepare(`INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`);
    settings.forEach(([k, v]) => stmtSettings.run(k, v));
    stmtSettings.finalize();

    // Seed News
    const newsItems = [
      [
        'Şampiyonluk Yolunda Dev Adım!',
        'sampiyonluk-yolunda-dev-adim',
        'Futbol takımımız, ligin 32. haftasında kendi evinde çıktığı kritik derbi maçından 3-1 galip ayrılarak liderliğini sürdürdü ve şampiyonluk yolunda dev bir adım attı. Gollerimiz 23. dakikada Kerem, 45. dakikada Icardi ve 82. dakikada Mertens\'ten geldi. Karşılaşma boyunca muhteşem taraftar desteği ile sahayı domine eden takımımız, son haftalara büyük avantajla giriyor. Teknik direktörümüz maç sonu yaptığı açıklamada "Tüm camiaya armağan olsun, konsantrasyonumuzu bozmadan yola devam edeceğiz" dedi.',
        'Süper Lig derbisinde evimizde aldığımız 3-1\'lik muhteşem galibiyetle liderliğimizi ve şampiyonluk iddiamızı perçinledik.',
        '/uploads/whatsapp-image-2026-08-05-at-20-45-38-1787482649753.jpeg',
        '2026-08-22'
      ],
      [
        'Yeni Transferimiz Sağlık Kontrolünden Geçti',
        'yeni-transferimiz-saglik-kontrolunden-gecti',
        'Kulübümüzün kadrosuna katmak üzere anlaşmaya vardığı dünyaca ünlü orta saha oyuncusu bugün sabah saatlerinde sponsor hastanemizde detaylı sağlık kontrollerinden geçti. Kardiyoloji, ortopedi, dahiliye ve göz muayeneleri yapılan futbolcuda herhangi bir olumsuz bulguya rastlanmadı. Öğleden sonra resmi sözleşmeyi imzalaması ve akşam antrenmanında takımla ilk çalışmasına katılması bekleniyor. İmza töreni canlı yayınla kulüp televizyonumuzda yayınlanacaktır.',
        'Kadromuzu güçlendiren yeni yıldız orta saha oyuncumuz, sağlık kontrollerini başarıyla tamamladı.',
        '/uploads/whatsapp-image-2026-08-05-at-20-30-19-1787484256763.jpeg',
        '2026-08-20'
      ],
      [
        'Genç Yetenekler Akademimizde Yetişiyor',
        'genc-yetenekler-akademimizde-yetisiyor',
        'Galata Altyapı Akademisi, her yıl olduğu gibi bu yıl da Türk sporuna yeni yıldızlar kazandırmaya devam ediyor. U-17 ve U-19 takımlarımızın kazandığı şampiyonlukların ardından altyapı koordinatörümüz, modern tesislerimizde dünya standartlarında eğitim uygulandığını belirtti. Genç sporcuların sadece sportif başarıya değil, aynı zamanda ahlaki ve zihinsel gelişime de odaklandığı akademimiz, A takım seviyesine bu yıl en az 4 genç oyuncu kazandırmayı hedefliyor.',
        'Futbol akademimiz, modern altyapı tesisleri ve bilimsel antrenman metodlarıyla geleceğin aslanlarını hazırlıyor.',
        '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787482663350.jpeg',
        '2026-08-18'
      ]
    ];

    const stmtNews = this.db.prepare(`INSERT OR IGNORE INTO news (title, slug, content, summary, image_url, published_at, status) VALUES (?, ?, ?, ?, ?, ?, 'published')`);
    newsItems.forEach(item => stmtNews.run(item));
    stmtNews.finalize();

    // Seed Announcements
    const announcements = [
      [
        'Haftalık Antrenman Programı ve Basın Bilgilendirmesi',
        'A takımımızın önümüzdeki hafta yapacağı antrenman programı açıklanmıştır. Salı ve Perşembe günleri yapılacak antrenmanlar basına ve taraftara ilk 15 dakikası açık olarak Florya Metin Oktay Tesisleri\'nde gerçekleştirilecektir. Çarşamba günü ise çift idman planlanmıştır.',
        '2026-08-23',
        'normal'
      ],
      [
        'Sezonluk Kombine Bilet Satışları Hakkında Önemli Duyuru',
        '2026-2027 futbol sezonu genel kombine bilet satışları 25 Ağustos Salı günü saat 10:00 itibarıyla başlayacaktır. Taraftarlarımız Passo.com.tr adresi ve stadyum gişelerinden vizelerini yenileyebilir ve yeni kombine satın alabilirler. Kulüp üyelerimize %10 indirim uygulanacaktır.',
        '2026-08-22',
        'high'
      ],
      [
        'Voleybol Altyapı Oyuncu Seçmeleri Başlıyor',
        'Geleceğin sultanlarını ve efe adaylarını arıyoruz! 2012-2015 doğumlu kız ve erkek çocukları için voleybol altyapı seçmelerimiz 29-30 Ağustos tarihlerinde Taç Spor Tesisleri\'nde yapılacaktır. Başvurular online form üzerinden alınmaktadır.',
        '2026-08-19',
        'normal'
      ]
    ];

    const stmtAnn = this.db.prepare(`INSERT OR IGNORE INTO announcements (title, content, published_at, importance, status) VALUES (?, ?, ?, ?, 'published')`);
    announcements.forEach(item => stmtAnn.run(item));
    stmtAnn.finalize();

    // Seed Fixtures
    const fixtures = [
      ['Galata', 'Fenerbahçe', '2026-09-12', '19:00', 'Nef Stadyumu', 'Süper Lig', null, null, 'upcoming'],
      ['Beşiktaş', 'Galata', '2026-09-20', '20:00', 'Tüpraş Stadyumu', 'Süper Lig', null, null, 'upcoming'],
      ['Galata', 'Trabzonspor', '2026-08-15', '21:45', 'Nef Stadyumu', 'Süper Lig', 2, 1, 'played'],
      ['Konyaspor', 'Galata', '2026-08-09', '19:15', 'Konya Büyükşehir Stadyumu', 'Süper Lig', 0, 3, 'played']
    ];

    const stmtFix = this.db.prepare(`INSERT OR IGNORE INTO fixtures (home_team, away_team, date, time, stadium, league, home_score, away_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    fixtures.forEach(item => stmtFix.run(item));
    stmtFix.finalize();

    // Seed Gallery
    const gallery = [
      ['Şampiyonluk Kutlaması', 'Kupayı havaya kaldırırken coşkumuz', '/uploads/whatsapp-image-2026-08-05-at-20-45-38-1787482649753.jpeg', 'Futbol'],
      ['A Takım Antrenmanı', 'Yoğun sezon hazırlıkları sürüyor', '/uploads/whatsapp-image-2026-08-05-at-20-30-19-1787484256763.jpeg', 'Antrenman'],
      ['Muhteşem Koreografi', 'Derbide ultrAslan\'dan dev şov', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787482663350.jpeg', 'Taraftar'],
      ['Yeni Transfer Karşılama', 'Havalimanında meşaleli karşılama', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787481900147.jpeg', 'Taraftar']
    ];

    const stmtGal = this.db.prepare(`INSERT OR IGNORE INTO gallery (title, description, image_url, category) VALUES (?, ?, ?, ?)`);
    gallery.forEach(item => stmtGal.run(item));
    stmtGal.finalize();

    // Seed Sports
    const sports = [
      ['Futbol', 'Milyonları peşinden sürükleyen, şanlı tarihimizin lokomotif branşı.', '/uploads/whatsapp-image-2026-08-05-at-20-45-38-1787482649753.jpeg', 1],
      ['Basketbol', 'Yenilmez Armada ruhuyla parkede mücadele eden erkek ve kadın takılarımız.', '/uploads/whatsapp-image-2026-08-05-at-20-30-19-1787484256763.jpeg', 2],
      ['Voleybol', 'Avrupa kupalarında ses getiren, filenin aslanları ve sultanları.', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787482663350.jpeg', 3],
      ['Espor', 'Dijital arenalarda şampiyonluk kovalayan en yeni ve dinamik branşımız.', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787481900147.jpeg', 4]
    ];

    const stmtSports = this.db.prepare(`INSERT OR IGNORE INTO sports (name, description, image_url, display_order) VALUES (?, ?, ?, ?)`);
    sports.forEach(item => stmtSports.run(item));
    stmtSports.finalize();

    // Seed Staff
    const staff = [
      ['Okan Buruk', 'Teknik Direktör', 'Eski efsane futbolcumuz, takımı şampiyonluklara ulaştıran baş antrenörümüz.', '/uploads/whatsapp-image-2026-08-05-at-20-45-38-1787482649753.jpeg', 1],
      ['İrfan Saraloğlu', 'Antrenör / Yardımcı Antrenör', 'Uzun yıllardır teknik heyetin en önemli taktik beyinlerinden biri.', '/uploads/whatsapp-image-2026-08-05-at-20-30-19-1787484256763.jpeg', 2],
      ['Fadıl Koşutan', 'Kaleci Antrenörü', 'Kalecilerimizi ve Muslera\'yı dünya standartlarında hazırlayan kaleci departmanı şefimiz.', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787482663350.jpeg', 3]
    ];

    const stmtStaff = this.db.prepare(`INSERT OR IGNORE INTO technical_staff (name, role, biography, image_url, display_order, status) VALUES (?, ?, ?, ?, ?, 'active')`);
    staff.forEach(item => stmtStaff.run(item));
    stmtStaff.finalize();

    // Seed Management
    const management = [
      ['Dursun Aydın Özbek', 'Kulüp Başkanı', '/uploads/whatsapp-image-2026-08-05-at-20-45-38-1787482649753.jpeg', 1],
      ['Metin Öztürk', 'İkinci Başkan', '/uploads/whatsapp-image-2026-08-05-at-20-30-19-1787484256763.jpeg', 2],
      ['Niyazi Yelkencioğlu', 'Başkan Yardımcısı', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787482663350.jpeg', 3],
      ['Eray Yazgan', 'Genel Sekreter', '/uploads/whatsapp-image-2026-08-20-at-17-39-45-1787481900147.jpeg', 4]
    ];

    const stmtMgmt = this.db.prepare(`INSERT OR IGNORE INTO management (name, role, image_url, display_order) VALUES (?, ?, ?, ?)`);
    management.forEach(item => stmtMgmt.run(item));
    stmtMgmt.finalize();

    console.log('Database initialized and seeded successfully.');
  }

  // Promise wrapper for db.all (fetch multiple rows)
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.connectionError) {
        return reject(new Error('Database connection failed: ' + this.connectionError.message));
      }
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Promise wrapper for db.get (fetch single row)
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.connectionError) {
        return reject(new Error('Database connection failed: ' + this.connectionError.message));
      }
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // Promise wrapper for db.run (insert, update, delete)
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (this.connectionError) {
        return reject(new Error('Database connection failed: ' + this.connectionError.message));
      }
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  // Close connection
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Singleton database instance
export const db = new Database();

/**
 * Hash a password using Node.js native pbkdf2
 * @param {string} password 
 * @returns {{hash: string, salt: string}}
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify a password against a hash and salt
 * @param {string} password 
 * @param {string} hash 
 * @param {string} salt 
 * @returns {boolean}
 */
export function verifyPassword(password, hash, salt) {
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return testHash === hash;
}
