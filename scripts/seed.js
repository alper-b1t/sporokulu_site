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

  const stmtSettings = db.prepare(`INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)`);
  settings.forEach(([k, v]) => stmtSettings.run(k, v));
  stmtSettings.finalize();

  // News Seed
  const newsItems = [
    [
      'Şampiyonluk Yolunda Dev Adım!',
      'sampiyonluk-yolunda-dev-adim',
      'Futbol takımımız, ligin 32. haftasında kendi evinde çıktığı kritik derbi maçından 3-1 galip ayrılarak liderliğini sürdürdü ve şampiyonluk yolunda dev bir adım attı. Gollerimiz 23. dakikada Kerem, 45. dakikada Icardi ve 82. dakikada Mertens\'ten geldi. Karşılaşma boyunca muhteşem taraftar desteği ile sahayı domine eden takımımız, son haftalara büyük avantajla giriyor. Teknik direktörümüz maç sonu yaptığı açıklamada "Tüm camiaya armağan olsun, konsantrasyonumuzu bozmadan yola devam edeceğiz" dedi.',
      'Süper Lig derbisinde evimizde aldığımız 3-1\'lik muhteşem galibiyetle liderliğimizi ve şampiyonluk iddiamızı perçinledik.',
      '/uploads/news_derby.jpg',
      '2026-08-22'
    ],
    [
      'Yeni Transferimiz Sağlık Kontrolünden Geçti',
      'yeni-transferimiz-saglik-kontrolunden-gecti',
      'Kulübümüzün kadrosuna katmak üzere anlaşmaya vardığı dünyaca ünlü orta saha oyuncusu bugün sabah saatlerinde sponsor hastanemizde detaylı sağlık kontrollerinden geçti. Kardiyoloji, ortopedi, dahiliye ve göz muayeneleri yapılan futbolcuda herhangi bir olumsuz bulguya rastlanmadı. Öğleden sonra resmi sözleşmeyi imzalaması ve akşam antrenmanında takımla ilk çalışmasına katılması bekleniyor. İmza töreni canlı yayınla kulüp televizyonumuzda yayınlanacaktır.',
      'Kadromuzu güçlendiren yeni yıldız orta saha oyuncumuz, sağlık kontrollerini başarıyla tamamladı.',
      '/uploads/news_transfer.jpg',
      '2026-08-20'
    ],
    [
      'Genç Yetenekler Akademimizde Yetişiyor',
      'genc-yetenekler-akademimizde-yetisiyor',
      'Galatasaray Altyapı Akademisi, her yıl olduğu gibi bu yıl da Türk sporuna yeni yıldızlar kazandırmaya devam ediyor. U-17 ve U-19 takımlarımızın kazandığı şampiyonlukların ardından altyapı koordinatörümüz, modern tesislerimizde dünya standartlarında eğitim uygulandığını belirtti. Genç sporcuların sadece sportif başarıya değil, aynı zamanda ahlaki ve zihinsel gelişime de odaklandığı akademimiz, A takım seviyesine bu yıl en az 4 genç oyuncu kazandırmayı hedefliyor.',
      'Futbol akademimiz, modern altyapı tesisleri ve bilimsel antrenman metodlarıyla geleceğin aslanlarını hazırlıyor.',
      '/uploads/news_academy.jpg',
      '2026-08-18'
    ]
  ];

  const stmtNews = db.prepare(`INSERT OR IGNORE INTO news (title, slug, content, summary, image_url, published_at, status) VALUES (?, ?, ?, ?, ?, ?, 'published')`);
  newsItems.forEach(item => stmtNews.run(item));
  stmtNews.finalize();

  // Announcements Seed
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

  const stmtAnn = db.prepare(`INSERT OR IGNORE INTO announcements (title, content, published_at, importance, status) VALUES (?, ?, ?, ?, 'published')`);
  announcements.forEach(item => stmtAnn.run(item));
  stmtAnn.finalize();

  // Fixtures Seed
  const fixtures = [
    ['Galata', 'Fenerbahçe', '2026-09-12', '19:00', 'Nef Stadyumu', 'Süper Lig', null, null, 'upcoming'],
    ['Beşiktaş', 'Galata', '2026-09-20', '20:00', 'Tüpraş Stadyumu', 'Süper Lig', null, null, 'upcoming'],
    ['Galata', 'Trabzonspor', '2026-08-15', '21:45', 'Nef Stadyumu', 'Süper Lig', 2, 1, 'played'],
    ['Konyaspor', 'Galata', '2026-08-09', '19:15', 'Konya Büyükşehir Stadyumu', 'Süper Lig', 0, 3, 'played']
  ];

  const stmtFix = db.prepare(`INSERT OR IGNORE INTO fixtures (home_team, away_team, date, time, stadium, league, home_score, away_score, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  fixtures.forEach(item => stmtFix.run(item));
  stmtFix.finalize();

  // Gallery Seed
  const gallery = [
    ['Şampiyonluk Kutlaması', 'Kupayı havaya kaldırırken coşkumuz', '/uploads/gallery_cup.jpg', 'Futbol'],
    ['A Takım Antrenmanı', 'Yoğun sezon hazırlıkları sürüyor', '/uploads/gallery_training.jpg', 'Antrenman'],
    ['Muhteşem Koreografi', 'Derbide ultrAslan\'dan dev şov', '/uploads/gallery_fans.jpg', 'Taraftar'],
    ['Yeni Transfer Karşılama', 'Havalimanında meşaleli karşılama', '/uploads/gallery_fans2.jpg', 'Taraftar']
  ];

  const stmtGal = db.prepare(`INSERT OR IGNORE INTO gallery (title, description, image_url, category) VALUES (?, ?, ?, ?)`);
  gallery.forEach(item => stmtGal.run(item));
  stmtGal.finalize();

  // Sports Branches Seed
  const sports = [
    ['Futbol', 'Milyonları peşinden sürükleyen, şanlı tarihimizin lokomotif branşı.', '/uploads/branch_football.jpg', 1],
    ['Basketbol', 'Yenilmez Armada ruhuyla parkede mücadele eden erkek ve kadın takımlarımız.', '/uploads/branch_basketball.jpg', 2],
    ['Voleybol', 'Avrupa kupalarında ses getiren, filenin aslanları ve sultanları.', '/uploads/branch_volleyball.jpg', 3],
    ['Espor', 'Dijital arenalarda şampiyonluk kovalayan en yeni ve dinamik branşımız.', '/uploads/branch_esports.jpg', 4]
  ];

  const stmtSports = db.prepare(`INSERT OR IGNORE INTO sports (name, description, image_url, display_order) VALUES (?, ?, ?, ?)`);
  sports.forEach(item => stmtSports.run(item));
  stmtSports.finalize();

  // Technical Staff Seed
  const staff = [
    ['Okan Buruk', 'Teknik Direktör', 'Eski efsane futbolcumuz, takımı şampiyonluklara ulaştıran baş antrenörümüz.', '/uploads/staff_coach.jpg', 1],
    ['İrfan Saraloğlu', 'Antrenör / Yardımcı Antrenör', 'Uzun yıllardır teknik heyetin en önemli taktik beyinlerinden biri.', '/uploads/staff_ass1.jpg', 2],
    ['Fadıl Koşutan', 'Kaleci Antrenörü', 'Kalecilerimizi ve Muslera\'yı dünya standartlarında hazırlayan kaleci departmanı şefimiz.', '/uploads/staff_gk.jpg', 3]
  ];

  const stmtStaff = db.prepare(`INSERT OR IGNORE INTO technical_staff (name, role, biography, image_url, display_order, status) VALUES (?, ?, ?, ?, ?, 'active')`);
  staff.forEach(item => stmtStaff.run(item));
  stmtStaff.finalize();

  // Management Seed
  const management = [
    ['Dursun Aydın Özbek', 'Kulüp Başkanı', '/uploads/mgmt_president.jpg', 1],
    ['Metin Öztürk', 'İkinci Başkan', '/uploads/mgmt_vp1.jpg', 2],
    ['Niyazi Yelkencioğlu', 'Başkan Yardımcısı', '/uploads/mgmt_vp2.jpg', 3],
    ['Eray Yazgan', 'Genel Sekreter', '/uploads/mgmt_sec.jpg', 4]
  ];

  const stmtMgmt = db.prepare(`INSERT OR IGNORE INTO management (name, role, image_url, display_order) VALUES (?, ?, ?, ?)`);
  management.forEach(item => stmtMgmt.run(item));
  stmtMgmt.finalize();

  console.log('Seeding completed successfully!');
  db.close();
});
