# Galatasaray Spor Kulübü - CMS Web Sitesi

Modern, responsive, yönetilebilir ve dinamik bir **Spor Kulübü CMS (Content Management System) Web Portalı**.

Bu proje, Next.js (App Router), SQLite ve Vanilla CSS Custom Properties (CSS Değişkenleri) kullanılarak modern, premium bir tasarım dili ile (Galatasaray Sarı-Kırmızı renk teması odaklı) geliştirilmiştir. Tüm dinamik içerikler (Haberler, Duyurular, Fikstür, Galeri, Spor Branşları, Teknik Kadro ve Yönetim Kurulu) bir yönetim paneli (CMS) üzerinden yönetilebilir. Kulüp adı, telefon, e-posta, WhatsApp numarası ve sitenin renkleri dahi doğrudan yönetim panelindeki "Site Ayarları" sekmesinden anlık olarak değiştirilebilir.

---

## Özellikler

* **Responsive Tasarım**: Mobil, tablet ve masaüstü uyumlu premium karanlık tema (Dark Mode).
* **Dinamik CSS Teması**: Sitenin renkleri veri tabanından yüklenir, kod değiştirmeden admin panelinden güncellenebilir.
* **Hero Slider**: Otomatik ve manuel geçişli, haberlerden beslenen dev görsel carousel.
* **3 Kolonlu Ana Sayfa**: En güncel Haberler, önemli Duyurular ve Fikstür maç durumları tek ekranda.
* **Detaylı Sayfalar**: Haber Detay (SEO Dostu slug yapılı), Branşlar, Galeri (Lightbox görsel büyütücülü), Kadro listeleri.
* **Güvenli Admin Paneli**: Giriş korumalı (`/admin`), session cookie tabanlı ve şifreleri pbkdf2 algoritmasıyla güvenli hash'leyen CMS.
* **Resim Yükleme Servisi**: API seviyesinde güvenlik denetimli (dosya tipi ve 5MB boyut kısıtlamalı) yerel resim yükleme.

---

## Kurulum ve Çalıştırma

Local ortamda projeyi kurup çalıştırmak için aşağıdaki adımları sırasıyla izleyin:

### 1. Bağımlılıkları Yükleyin

Proje dizininde terminali açarak gerekli paketleri yükleyin:

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

Kök dizindeki `.env.example` dosyasını kopyalayarak `.env` dosyası oluşturun:

```bash
copy .env.example .env
```

`.env` dosyasını açıp istediğiniz `JWT_SECRET` değerini girin.

### 3. Veri Tabanını Oluşturun ve Seed Edin

Veri tabanı tablolarını oluşturmak ve Galatasaray Sarı-Kırmızı tema ayarları ile örnek içerikleri yerleştirmek için hazırlanan seed scriptini çalıştırın:

```bash
node ./scripts/seed.js
```

Bu işlem dizinde `club.db` isimli SQLite veri tabanı dosyasını ve örnek içerikleri oluşturacaktır.

### 4. Geliştirici Sunucusunu Başlatın

Local sunucuyu ayağa kaldırın:

```bash
npm run dev
```

Sunucu başladıktan sonra tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## Yönetim Paneli Giriş Bilgileri

Yönetim paneline erişmek için tarayıcınızda [http://localhost:3000/admin](http://localhost:3000/admin) adresine gidin.

* **Kullanıcı Adı**: `admin`
* **Şifre**: `admin123`

Giriş yaptıktan sonra sol menüyü kullanarak tüm içerikleri ekleyebilir, düzenleyebilir, silebilir ve **Site Ayarları** bölümünden kulüp adı, logo, iletişim kanalları ile tema renklerini dizebilirsiniz.

---

## Proje Klasör Yapısı

* `src/app/` - Sayfa yönlendirmeleri (App Router) ve API endpoint'leri (`/api`).
* `src/components/` - Ortak kullanılan arayüz bileşenleri (Header, Footer, HeroSlider).
* `src/lib/` - SQLite veri tabanı (`db.js`) ve şifreleme/JWT doğrulama (`auth-helper.js`) modülleri.
* `scripts/` - Veri tabanını kurup örnek verileri yükleyen seed betiği (`seed.js`).
* `public/` - Statik dosyalar, simgeler ve yüklenen resimlerin saklandığı `uploads/` dizini.

---

## Production Derlemesi

Uygulamayı derleyip yayına hazır hale getirmek için:

```bash
npm run build
npm run start
```
