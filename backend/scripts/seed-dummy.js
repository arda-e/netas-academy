"use strict";

const { createStrapi } = require("/app/backend/node_modules/@strapi/strapi");

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[ığüşöçİĞÜŞÖÇ]/g, (c) => ({ i:"i",ğ:"g",ü:"u",ş:"s",ö:"o",ç:"c",İ:"i",Ğ:"g",Ü:"u",Ş:"s",Ö:"o",Ç:"c" }[c] || c))
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

async function seed() {
  const app = await createStrapi({ appDir: "/app/backend", distDir: "/app/backend/dist" }).load();

  // ── Teachers ────────────────────────────────────────────────────────────
  const teacherDefs = [
    { fullName: "Ahmet Yılmaz",   headline: "Siber Güvenlik Uzmanı",                email: "ahmet.yilmaz@netas.com.tr",  expertiseAreas: ["Siber Güvenlik","Ağ Güvenliği"] },
    { fullName: "Elif Demir",     headline: "Yazılım Geliştirme Eğitmeni",           email: "elif.demir@netas.com.tr",    expertiseAreas: ["Java","Spring Boot","Mikroservisler"] },
    { fullName: "Mehmet Çelik",   headline: "Veri Bilimi ve Yapay Zeka Uzmanı",      email: "mehmet.celik@netas.com.tr",  expertiseAreas: ["Python","Makine Öğrenmesi"] },
    { fullName: "Ayşe Kaya",      headline: "Bulut Altyapı Mimarı",                  email: "ayse.kaya@netas.com.tr",     expertiseAreas: ["AWS","Azure","Kubernetes"] },
    { fullName: "Can Özkan",      headline: "ISTQB Baş Eğitmeni",                    email: "can.ozkan@netas.com.tr",     expertiseAreas: ["Yazılım Testi","ISTQB"] },
    { fullName: "Selin Arslan",   headline: "İş Süreçleri ve Proje Yönetimi Uzmanı", email: "selin.arslan@netas.com.tr",  expertiseAreas: ["PMP","Agile","Scrum"] },
    { fullName: "Burak Şahin",    headline: "Ağ ve Sistem Yöneticisi",               email: "burak.sahin@netas.com.tr",   expertiseAreas: ["CCNA","Linux","Windows Server"] },
    { fullName: "Zeynep Yıldız",  headline: "Yapay Zeka ve NLP Araştırmacısı",       email: "zeynep.yildiz@netas.com.tr", expertiseAreas: ["NLP","Büyük Dil Modelleri"] },
    { fullName: "Oğuz Erdoğan",   headline: "Etik Hacker ve Sızma Testi Uzmanı",     email: "oguz.erdogan@netas.com.tr",  expertiseAreas: ["Penetrasyon Testi","OSCP"] },
    { fullName: "Fatma Koç",      headline: "Veri Tabanı ve SQL Uzmanı",              email: "fatma.koc@netas.com.tr",     expertiseAreas: ["PostgreSQL","Oracle","SQL"] },
  ];

  const teacherIds = [];
  for (const t of teacherDefs) {
    let rec = await app.db.query("api::teacher.teacher").findOne({ where: { email: t.email } });
    if (!rec) {
      rec = await app.db.query("api::teacher.teacher").create({
        data: { ...t, slug: slugify(t.fullName), publishedAt: new Date() },
      });
      console.log(`✓ Teacher: ${t.fullName}`);
    } else {
      console.log(`- Teacher exists: ${t.fullName}`);
    }
    teacherIds.push(rec.id);
  }

  // ── Courses ──────────────────────────────────────────────────────────────
  const courseDefs = [
    { title: "Siber Güvenliğe Giriş",                      slug: "siber-guvenlige-giris",                       topicArea: "siber-guvenlik",       level: "temel",  summary: "Temel siber güvenlik kavramları ve korunma yöntemleri.",            teacherIdx: 0 },
    { title: "Java ile Mikroservis Mimarisi",               slug: "java-ile-mikroservis-mimarisi",               topicArea: "yazilim-gelistirme",   level: "orta",   summary: "Spring Boot ve Docker ile modern mikroservis geliştirme.",           teacherIdx: 1 },
    { title: "Python ile Makine Öğrenmesi",                 slug: "python-ile-makine-ogrenmesi",                 topicArea: "veri-bilimi",          level: "orta",   summary: "Scikit-learn ve TensorFlow ile ML modelleri geliştirme.",            teacherIdx: 2 },
    { title: "AWS Cloud Practitioner",                      slug: "aws-cloud-practitioner",                     topicArea: "bulut-altyapi",        level: "temel",  summary: "AWS bulut hizmetleri ve sertifikasyon hazırlığı.",                   teacherIdx: 3 },
    { title: "ISTQB Temel Seviye Sertifikasyon Eğitimi",    slug: "istqb-temel-seviye-sertifikasyon-egitimi",    topicArea: "yazilim-gelistirme",   level: "temel",  summary: "ISTQB CTFL sertifikası için kapsamlı hazırlık eğitimi.",             teacherIdx: 4 },
    { title: "Scrum Master Eğitimi",                        slug: "scrum-master-egitimi",                        topicArea: "is-surecleri",         level: "temel",  summary: "Scrum framework ve Agile proje yönetimi.",                          teacherIdx: 5 },
    { title: "Linux Sistem Yönetimi",                       slug: "linux-sistem-yonetimi",                       topicArea: "bulut-altyapi",        level: "orta",   summary: "Linux sunucu kurulumu, yapılandırma ve yönetimi.",                   teacherIdx: 6 },
    { title: "Büyük Dil Modelleri ve Prompt Mühendisliği",  slug: "buyuk-dil-modelleri-ve-prompt-muhendisligi",  topicArea: "yapay-zeka",           level: "orta",   summary: "LLM teknolojileri ve etkin prompt tasarımı.",                        teacherIdx: 7 },
    { title: "Sızma Testi ve Etik Hacking",                 slug: "sizma-testi-ve-etik-hacking",                 topicArea: "siber-guvenlik",       level: "ileri",  summary: "Penetrasyon testi metodolojileri ve araçları.",                      teacherIdx: 8 },
    { title: "Veri Tabanı ve SQL Eğitimi",                  slug: "veri-tabani-sql-egitimi",                     topicArea: "yazilim-gelistirme",   level: "temel",  summary: "İlişkisel veri tabanı tasarımı ve SQL optimizasyonu.",               teacherIdx: 9 },
  ];

  const courseIds = [];
  for (const c of courseDefs) {
    const { teacherIdx, ...data } = c;
    let rec = await app.db.query("api::course.course").findOne({ where: { slug: c.slug } });
    if (!rec) {
      rec = await app.db.query("api::course.course").create({
        data: { ...data, teacher: teacherIds[teacherIdx], publishedAt: new Date() },
      });
      console.log(`✓ Course: ${c.title}`);
    } else {
      console.log(`- Course exists: ${c.title}`);
    }
    courseIds.push(rec.id);
  }

  // ── Events ────────────────────────────────────────────────────────────────
  const d = (daysFromNow, hours = 0) => new Date(Date.now() + daysFromNow * 864e5 + hours * 36e5);
  const eventDefs = [
    { title: "Siber Güvenlik Tehditleri 2026",              slug: "siber-guvenlik-tehditleri-2026",              eventType: "etkinlik", topicArea: "siber-guvenlik",      startsAt: d(7),   endsAt: d(7,3),   location: "İstanbul, Netas Merkez Ofis", courseIdx: 0 },
    { title: "Java Mikroservis Workshop",                   slug: "java-mikroservis-workshop",                   eventType: "egitim",   topicArea: "yazilim-gelistirme",  startsAt: d(10),  endsAt: d(12),    location: "Ankara, Teknopark",           courseIdx: 1 },
    { title: "Makine Öğrenmesi Bootcamp",                   slug: "makine-ogrenmesi-bootcamp",                   eventType: "kurs",     topicArea: "veri-bilimi",         startsAt: d(14),  endsAt: d(17),    location: "Online (Zoom)",               courseIdx: 2 },
    { title: "AWS Cloud Day 2026",                          slug: "aws-cloud-day-2026",                          eventType: "etkinlik", topicArea: "bulut-altyapi",       startsAt: d(21),  endsAt: d(21,8),  location: "İstanbul, Hilton",            courseIdx: 3 },
    { title: "ISTQB Sınav Hazırlık Kampı",                  slug: "istqb-sinav-hazirlık-kampi",                  eventType: "egitim",   topicArea: "yazilim-gelistirme",  startsAt: d(28),  endsAt: d(30),    location: "Online (Teams)",              courseIdx: 4 },
    { title: "Agile Liderlik Atölyesi",                     slug: "agile-liderlik-atolyesi",                     eventType: "etkinlik", topicArea: "is-surecleri",        startsAt: d(35),  endsAt: d(35,5),  location: "İzmir, Teknoloji Merkezi",    courseIdx: 5 },
    { title: "Linux Güvenlik Sertleştirme",                 slug: "linux-guvenlik-sertlestirme",                 eventType: "egitim",   topicArea: "bulut-altyapi",       startsAt: d(42),  endsAt: d(44),    location: "Online (Zoom)",               courseIdx: 6 },
    { title: "Yapay Zeka ile Değişen Hayatlar",             slug: "yapay-zeka-ile-degisen-hayatlar",             eventType: "etkinlik", topicArea: "yapay-zeka",          startsAt: d(49),  endsAt: d(49,4),  location: "İstanbul, Netas Merkez Ofis", courseIdx: 7 },
    { title: "Etik Hacking Yaz Okulu",                      slug: "etik-hacking-yaz-okulu",                      eventType: "kurs",     topicArea: "siber-guvenlik",      startsAt: d(56),  endsAt: d(63),    location: "Ankara, Güvenlik Araştırma Merkezi", courseIdx: 8 },
    { title: "SQL Performans Optimizasyonu",                 slug: "sql-performans-optimizasyonu",                eventType: "egitim",   topicArea: "yazilim-gelistirme",  startsAt: d(63),  endsAt: d(64),    location: "Online (Teams)",              courseIdx: 9 },
  ];

  for (const e of eventDefs) {
    const { courseIdx, ...data } = e;
    let rec = await app.db.query("api::event.event").findOne({ where: { slug: e.slug } });
    if (!rec) {
      await app.db.query("api::event.event").create({
        data: { ...data, course: courseIds[courseIdx], publishedAt: new Date() },
      });
      console.log(`✓ Event: ${e.title}`);
    } else {
      console.log(`- Event exists: ${e.title}`);
    }
  }

  console.log("\n✅ Seed complete.");
  await app.destroy();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
