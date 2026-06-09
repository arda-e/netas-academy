import Strapi from "@strapi/strapi";

async function seed() {
  const app = await Strapi({ distDir: "./dist" }).load();

  // ── Teachers ─────────────────────────────────────────────────────────────
  const teachers = [
    { fullName: "Ahmet Yılmaz", headline: "Siber Güvenlik Uzmanı", email: "ahmet.yilmaz@netas.com.tr", expertiseAreas: ["Siber Güvenlik", "Ağ Güvenliği"], targetTeams: "IT ve Güvenlik Ekipleri", teachingApproach: "Pratik odaklı, gerçek dünya senaryoları ile öğretim." },
    { fullName: "Elif Demir", headline: "Yazılım Geliştirme Eğitmeni", email: "elif.demir@netas.com.tr", expertiseAreas: ["Java", "Spring Boot", "Mikroservisler"], targetTeams: "Yazılım Geliştirme Ekipleri", teachingApproach: "Kod yazarak öğrenme metodolojisi." },
    { fullName: "Mehmet Çelik", headline: "Veri Bilimi ve Yapay Zeka Uzmanı", email: "mehmet.celik@netas.com.tr", expertiseAreas: ["Python", "Makine Öğrenmesi", "Derin Öğrenme"], targetTeams: "Veri ve Analitik Ekipleri", teachingApproach: "Proje tabanlı öğrenme." },
    { fullName: "Ayşe Kaya", headline: "Bulut Altyapı Mimarı", email: "ayse.kaya@netas.com.tr", expertiseAreas: ["AWS", "Azure", "Kubernetes"], targetTeams: "DevOps ve Altyapı Ekipleri", teachingApproach: "Hands-on lab ortamlarıyla öğretim." },
    { fullName: "Can Özkan", headline: "ISTQB Baş Eğitmeni", email: "can.ozkan@netas.com.tr", expertiseAreas: ["Yazılım Testi", "ISTQB", "Test Otomasyonu"], targetTeams: "QA ve Test Ekipleri", teachingApproach: "Sertifikasyon odaklı, örnek sorularla çalışma." },
    { fullName: "Selin Arslan", headline: "İş Süreçleri ve Proje Yönetimi Uzmanı", email: "selin.arslan@netas.com.tr", expertiseAreas: ["PMP", "Agile", "Scrum"], targetTeams: "Proje Yönetim Ofisleri", teachingApproach: "Vaka çalışmaları ve grup simülasyonları." },
    { fullName: "Burak Şahin", headline: "Ağ ve Sistem Yöneticisi", email: "burak.sahin@netas.com.tr", expertiseAreas: ["CCNA", "Linux", "Windows Server"], targetTeams: "Sistem ve Ağ Ekipleri", teachingApproach: "Laboratuvar ortamında uygulamalı eğitim." },
    { fullName: "Zeynep Yıldız", headline: "Yapay Zeka ve NLP Araştırmacısı", email: "zeynep.yildiz@netas.com.tr", expertiseAreas: ["NLP", "Büyük Dil Modelleri", "Python"], targetTeams: "AR-GE ve Yazılım Ekipleri", teachingApproach: "Teorik temel ve uygulama dengesi." },
    { fullName: "Oğuz Erdoğan", headline: "Etik Hacker ve Sızma Testi Uzmanı", email: "oguz.erdogan@netas.com.tr", expertiseAreas: ["Penetrasyon Testi", "OSCP", "Kali Linux"], targetTeams: "Güvenlik Ekipleri", teachingApproach: "Gerçek saldırı ve savunma senaryoları." },
    { fullName: "Fatma Koç", headline: "Veri Tabanı ve SQL Uzmanı", email: "fatma.koc@netas.com.tr", expertiseAreas: ["PostgreSQL", "Oracle", "SQL Optimizasyon"], targetTeams: "Veri Tabanı Yöneticileri", teachingApproach: "Performans odaklı, gerçek veri setleriyle çalışma." },
  ];

  const teacherIds: number[] = [];
  for (const t of teachers) {
    const existing = await app.db.query("api::teacher.teacher").findOne({ where: { email: t.email } });
    if (!existing) {
      const created = await app.db.query("api::teacher.teacher").create({
        data: { ...t, slug: t.fullName.toLowerCase().replace(/\s+/g, "-").replace(/[ığüşöçİĞÜŞÖÇ]/g, c => ({ i: "i", ğ: "g", ü: "u", ş: "s", ö: "o", ç: "c", İ: "i", Ğ: "g", Ü: "u", Ş: "s", Ö: "o", Ç: "c" }[c] || c)), publishedAt: new Date() },
      });
      teacherIds.push(created.id);
      console.log(`✓ Teacher: ${t.fullName}`);
    } else {
      teacherIds.push(existing.id);
      console.log(`- Teacher already exists: ${t.fullName}`);
    }
  }

  // ── Courses ───────────────────────────────────────────────────────────────
  const courses = [
    { title: "Siber Güvenliğe Giriş", slug: "siber-guvenlige-giris", summary: "Temel siber güvenlik kavramları ve korunma yöntemleri.", topicArea: "siber-guvenlik", level: "temel", targetAudience: "IT profesyonelleri ve sistem yöneticileri", businessValue: "Kurumsal güvenlik risklerini azaltır.", scopeSummary: "Ağ güvenliği, şifreleme, kimlik doğrulama.", outcomeBullets: "Temel güvenlik açıklarını tanıma\nGüvenli ağ tasarımı\nOlay müdahale süreçleri", teacherIdx: 0 },
    { title: "Java ile Mikroservis Mimarisi", slug: "java-ile-mikroservis-mimarisi", summary: "Spring Boot ve Docker ile modern mikroservis geliştirme.", topicArea: "yazilim-gelistirme", level: "orta", targetAudience: "Java geliştiricileri", businessValue: "Ölçeklenebilir ve bakımı kolay sistemler inşa etme.", scopeSummary: "Spring Boot, REST API, Docker, Kubernetes.", outcomeBullets: "Mikroservis tasarım prensipleri\nSpring Boot uygulaması\nKonteyner yönetimi", teacherIdx: 1 },
    { title: "Python ile Makine Öğrenmesi", slug: "python-ile-makine-ogrenmesi", summary: "Scikit-learn ve TensorFlow ile ML modelleri geliştirme.", topicArea: "veri-bilimi", level: "orta", targetAudience: "Veri bilimciler ve yazılım geliştiriciler", businessValue: "Veri odaklı iş kararları alma kapasitesi.", scopeSummary: "Veri ön işleme, model eğitimi, değerlendirme.", outcomeBullets: "Denetimli öğrenme algoritmaları\nModel optimizasyonu\nProduction deployment", teacherIdx: 2 },
    { title: "AWS Cloud Practitioner", slug: "aws-cloud-practitioner", summary: "AWS bulut hizmetleri ve sertifikasyon hazırlığı.", topicArea: "bulut-altyapi", level: "temel", targetAudience: "IT yöneticileri ve geliştiricleri", businessValue: "Bulut maliyetlerini optimize etme ve AWS sertifikası.", scopeSummary: "AWS temel hizmetler, güvenlik, fiyatlandırma.", outcomeBullets: "AWS Global Altyapısı\nTemel servisler (EC2, S3, RDS)\nAWS sertifikasyon sınavına hazırlık", teacherIdx: 3 },
    { title: "ISTQB Temel Seviye Sertifikasyon", slug: "istqb-temel-seviye-sertifikasyon-egitimi", summary: "ISTQB CTFL sertifikası için kapsamlı hazırlık eğitimi.", topicArea: "yazilim-gelistirme", level: "temel", targetAudience: "Test mühendisleri ve QA uzmanları", businessValue: "Uluslararası yazılım test sertifikasyonu.", scopeSummary: "Test temelleri, test tasarımı, test yönetimi.", outcomeBullets: "ISTQB sınav formatını anlama\nTest tekniklerini uygulama\nSertifika alma", teacherIdx: 4 },
    { title: "Scrum Master Eğitimi", slug: "scrum-master-egitimi", summary: "Scrum framework ve Agile proje yönetimi.", topicArea: "is-surecleri", level: "temel", targetAudience: "Proje yöneticileri ve takım liderleri", businessValue: "Agile dönüşüm ve ekip verimliliği.", scopeSummary: "Scrum rolleri, törenler, artefaktlar.", outcomeBullets: "Scrum framework kurulumu\nSprint planlama ve yönetimi\nAgile koçluk teknikleri", teacherIdx: 5 },
    { title: "Linux Sistem Yönetimi", slug: "linux-sistem-yonetimi", summary: "Linux sunucu kurulumu, yapılandırma ve yönetimi.", topicArea: "bulut-altyapi", level: "orta", targetAudience: "Sistem yöneticileri ve DevOps mühendisleri", businessValue: "Linux altyapı yönetimi ve güvenliği.", scopeSummary: "Shell scripting, servis yönetimi, ağ yapılandırma.", outcomeBullets: "Linux komut satırı ustalığı\nServis ve süreç yönetimi\nGüvenlik sertleştirme", teacherIdx: 6 },
    { title: "Büyük Dil Modelleri ve Prompt Mühendisliği", slug: "buyuk-dil-modelleri-ve-prompt-muhendisligi", summary: "LLM teknolojileri ve etkin prompt tasarımı.", topicArea: "yapay-zeka", level: "orta", targetAudience: "Yazılım geliştiriciler ve ürün yöneticileri", businessValue: "Yapay zeka araçlarını verimli kullanma.", scopeSummary: "GPT, Claude, prompt tasarımı, ince ayar.", outcomeBullets: "Prompt mühendisliği teknikleri\nLLM API entegrasyonu\nAI ürün geliştirme", teacherIdx: 7 },
    { title: "Sızma Testi ve Etik Hacking", slug: "sizma-testi-ve-etik-hacking", summary: "Penetrasyon testi metodolojileri ve araçları.", topicArea: "siber-guvenlik", level: "ileri", targetAudience: "Güvenlik uzmanları ve sistem yöneticileri", businessValue: "Kurumsal güvenlik açıklarını proaktif keşfetme.", scopeSummary: "Keşif, zafiyet analizi, exploit, raporlama.", outcomeBullets: "Kali Linux araçları\nWeb uygulama testleri\nRaporlama ve düzeltici aksiyonlar", teacherIdx: 8 },
    { title: "Veri Tabanı ve SQL Eğitimi", slug: "veri-tabani-sql-egitimi", summary: "İlişkisel veri tabanı tasarımı ve SQL optimizasyonu.", topicArea: "yazilim-gelistirme", level: "temel", targetAudience: "Geliştiriciler ve veri analistleri", businessValue: "Verimli veri tabanı sorgulama ve tasarımı.", scopeSummary: "SQL temelleri, join'ler, indeksleme, performans.", outcomeBullets: "Karmaşık SQL sorguları yazma\nVeri tabanı normalizasyonu\nPerformans optimizasyonu", teacherIdx: 9 },
  ];

  const courseIds: number[] = [];
  for (const c of courses) {
    const { teacherIdx, ...courseData } = c;
    const existing = await app.db.query("api::course.course").findOne({ where: { slug: c.slug } });
    if (!existing) {
      const created = await app.db.query("api::course.course").create({
        data: { ...courseData, teacher: teacherIds[teacherIdx], publishedAt: new Date() },
      });
      courseIds.push(created.id);
      console.log(`✓ Course: ${c.title}`);
    } else {
      courseIds.push(existing.id);
      console.log(`- Course already exists: ${c.title}`);
    }
  }

  // ── Events ────────────────────────────────────────────────────────────────
  const now = new Date();
  const events = [
    { title: "Siber Güvenlik Tehditleri 2026", slug: "siber-guvenlik-tehditleri-2026", summary: "2026 yılında öne çıkan siber tehditler ve korunma stratejileri.", eventType: "etkinlik", topicArea: "siber-guvenlik", startsAt: new Date(now.getTime() + 7 * 864e5), endsAt: new Date(now.getTime() + 7 * 864e5 + 3 * 36e5), location: "İstanbul, Netas Merkez Ofis", courseIdx: 0 },
    { title: "Java Mikroservis Workshop", slug: "java-mikroservis-workshop", summary: "Spring Boot ile mikroservis geliştirme uygulamalı workshop.", eventType: "egitim", topicArea: "yazilim-gelistirme", startsAt: new Date(now.getTime() + 10 * 864e5), endsAt: new Date(now.getTime() + 12 * 864e5), location: "Ankara, Teknopark", courseIdx: 1 },
    { title: "Makine Öğrenmesi Bootcamp", slug: "makine-ogrenmesi-bootcamp", summary: "Yoğun 3 günlük ML bootcamp — teoriden pratiğe.", eventType: "kurs", topicArea: "veri-bilimi", startsAt: new Date(now.getTime() + 14 * 864e5), endsAt: new Date(now.getTime() + 17 * 864e5), location: "Online (Zoom)", courseIdx: 2 },
    { title: "AWS Cloud Day", slug: "aws-cloud-day-2026", summary: "AWS servisleri ve bulut mimarisi tam gün etkinliği.", eventType: "etkinlik", topicArea: "bulut-altyapi", startsAt: new Date(now.getTime() + 21 * 864e5), endsAt: new Date(now.getTime() + 21 * 864e5 + 8 * 36e5), location: "İstanbul, Hilton", courseIdx: 3 },
    { title: "ISTQB Sınav Hazırlık Kampı", slug: "istqb-sinav-hazirlık-kampi", summary: "CTFL sınavı öncesi yoğun tekrar ve örnek soru çözümü.", eventType: "egitim", topicArea: "yazilim-gelistirme", startsAt: new Date(now.getTime() + 28 * 864e5), endsAt: new Date(now.getTime() + 30 * 864e5), location: "Online (Teams)", courseIdx: 4 },
    { title: "Agile Liderlik Atölyesi", slug: "agile-liderlik-atolyesi", summary: "Scrum ve Kanban ile ekip liderliği uygulamaları.", eventType: "etkinlik", topicArea: "is-surecleri", startsAt: new Date(now.getTime() + 35 * 864e5), endsAt: new Date(now.getTime() + 35 * 864e5 + 5 * 36e5), location: "İzmir, Teknoloji Merkezi", courseIdx: 5 },
    { title: "Linux Güvenlik Sertleştirme", slug: "linux-guvenlik-sertlestirme", summary: "Linux sunucularda güvenlik yapılandırması ve hardening.", eventType: "egitim", topicArea: "bulut-altyapi", startsAt: new Date(now.getTime() + 42 * 864e5), endsAt: new Date(now.getTime() + 44 * 864e5), location: "Online (Zoom)", courseIdx: 6 },
    { title: "Yapay Zeka ile Değişen Hayatlar", slug: "yapay-zeka-ile-degisen-hayatlar", summary: "LLM teknolojileri ve iş dünyasına etkileri paneli.", eventType: "etkinlik", topicArea: "yapay-zeka", startsAt: new Date(now.getTime() + 49 * 864e5), endsAt: new Date(now.getTime() + 49 * 864e5 + 4 * 36e5), location: "İstanbul, Netas Merkez Ofis", courseIdx: 7 },
    { title: "Etik Hacking Yaz Okulu", slug: "etik-hacking-yaz-okulu", summary: "Sızma testi araçları ve metodolojileri yaz okulu programı.", eventType: "kurs", topicArea: "siber-guvenlik", startsAt: new Date(now.getTime() + 56 * 864e5), endsAt: new Date(now.getTime() + 63 * 864e5), location: "Ankara, Güvenlik Araştırma Merkezi", courseIdx: 8 },
    { title: "SQL Performans Optimizasyonu", slug: "sql-performans-optimizasyonu", summary: "Yavaş sorguları hızlandırma ve veri tabanı profiling.", eventType: "egitim", topicArea: "yazilim-gelistirme", startsAt: new Date(now.getTime() + 63 * 864e5), endsAt: new Date(now.getTime() + 64 * 864e5), location: "Online (Teams)", courseIdx: 9 },
  ];

  for (const e of events) {
    const { courseIdx, ...eventData } = e;
    const existing = await app.db.query("api::event.event").findOne({ where: { slug: e.slug } });
    if (!existing) {
      await app.db.query("api::event.event").create({
        data: { ...eventData, course: courseIds[courseIdx], publishedAt: new Date() },
      });
      console.log(`✓ Event: ${e.title}`);
    } else {
      console.log(`- Event already exists: ${e.title}`);
    }
  }

  console.log("\n✅ Seed complete.");
  await app.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
