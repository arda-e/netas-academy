'use strict';

const DEFAULT_BASE_URL = 'http://44.216.170.38:1337';
const PAGE_SIZE = 100;

const baseUrl = (process.env.STRAPI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
const apiToken = process.env.STRAPI_API_TOKEN;
const dryRun = process.env.DRY_RUN !== 'false';

const collections = [
  {
    label: 'courses',
    endpoint: 'courses',
    fields: ['slug', 'topicArea', 'level', 'targetAudience', 'businessValue', 'scopeSummary', 'outcomeBullets'],
    source: [
      {
        slug: 'demo-data-platform-fundamentals',
        topicArea: 'veri-bilimi',
        level: 'temel',
        targetAudience: 'Veri mühendisleri, analitik ekipleri, ürün yöneticileri',
        businessValue:
          'Ekiplerinizin veri platformu kararlarını daha hızlı ve güvenle almasını sağlayın. Bu program, veri ürünleri tesliminde tekrar eden hataları azaltır ve paydaşlar arası ortak dili güçlendirir.',
        scopeSummary: 'Veri sözleşmeleri, ingestion desenleri, analitik teslim döngüsü ve ekip içi sahiplik modeli.',
        outcomeBullets:
          'Veri üreticisi-tüketicisi arasında net sözleşme; batch/stream ingestion karşılaştırması; sağlıklı analitik teslim kontrol noktaları.',
      },
      {
        slug: 'demo-applied-ai-for-product-teams',
        topicArea: 'yapay-zeka',
        level: 'orta',
        targetAudience: 'Ürün yöneticileri, yazılım geliştiriciler, tasarım ekipleri',
        businessValue:
          'Yapay zeka destekli ürün özelliklerini deney aşamasından güvenilir teslime taşıyın. Bu eğitim, ekiplerin prompt tasarımı, değerlendirme döngüleri ve sorumlu yaygınlaştırma konularında ortak bir dil geliştirmesini sağlar.',
        scopeSummary:
          'Prompt tasarımı, değerlendirme döngüleri, sorumlu AI yaygınlaştırma ve ürün ekipleri için pratik AI okuryazarlığı.',
        outcomeBullets:
          'Daha net özellik çerçeveleme; hızlı iterasyon döngüleri; AI destekli ürünlerde ekip içi iş birliği.',
      },
      {
        slug: 'demo-cloud-operations-bootcamp',
        topicArea: 'bulut-altyapi',
        level: 'orta',
        targetAudience: 'SRE ekipleri, platform mühendisleri, operasyon yöneticileri',
        businessValue:
          'Kritik bulut sistemlerinizin çalışma zamanı kararlılığını artırın. Bu bootcamp, olay müdahalesi, dağıtım güvenliği ve servis sağlığı izleme konularında ekibinize operasyonel refleks kazandırır.',
        scopeSummary: 'Çalışma zamanı görünürlüğü, olay müdahalesi, platform sahipliği, dağıtım kontrol noktaları.',
        outcomeBullets:
          'Olaylar yükselmeden sinyal yakalama; kritik servisler için güvenli dağıtım; net müdahale ve kurtarma sahipliği.',
      },
      {
        slug: 'demo-platform-reliability-workshop',
        topicArea: 'bulut-altyapi',
        level: 'ileri',
        targetAudience: 'Mühendislik yöneticileri, kıdemli teknik ekipler, platform sahipleri',
        businessValue:
          'Güvenilirlik hedefleri ile ürün hızı arasındaki dengeyi kurumsal ölçekte yönetin. Bu atölye, SLO tasarımı, hata bütçeleri ve servis sağlığı sinyalleriyle ekiplerinizin operasyonel olgunluğunu artırır.',
        scopeSummary:
          'SLO tasarımı, hata bütçeleri, servis sağlığı sinyalleri, çapraz fonksiyonlu koordinasyon ve operasyonel ritim.',
        outcomeBullets:
          'Ölçülebilir güvenilirlik hedefleri; hata bütçesi tabanlı karar mekanizması; aksiyona dönüşebilir operasyonel değişiklik planı.',
      },
      {
        slug: 'demo-frontend-systems-studio',
        topicArea: 'yazilim-gelistirme',
        level: 'orta',
        targetAudience: 'Frontend geliştiriciler, tasarım sistem ekipleri, UI mühendisleri',
        businessValue:
          'UI standartlarını tek seferlik bir tasarım çalışması olmaktan çıkarıp sürdürülebilir bir üretim iş akışına dönüştürün. Bu stüdyo programı, bileşen mimarisi, erişilebilirlik ve yayın güvenliği konularında ekibinize yapısal yetkinlik kazandırır.',
        scopeSummary:
          'Bileşen mimarisi, UI tutarlılığı, erişilebilirlik kontrolleri, yayın güvenli iş birliği ve tasarım-mühendislik hizalaması.',
        outcomeBullets:
          'Ürün alanları arasında net bileşen sınırları; yayın öncesi erişilebilirlik kontrolü; büyüyen sistemde uyumlu tasarım-mühendislik kararları.',
      },
      {
        slug: 'course',
        topicArea: 'yapay-zeka',
        level: 'temel',
        targetAudience: 'Yapay zeka kavramlarına giriş yapmak isteyen profesyoneller ve teknik olmayan ekipler',
        businessValue:
          'Ekiplerin yapay zeka fırsatlarını ortak bir dille değerlendirmesini ve ilk kullanım alanlarını daha bilinçli seçmesini sağlar.',
        scopeSummary: 'Temel AI kavramları, güncel kullanım alanları, riskler ve iş senaryosu değerlendirme yaklaşımı.',
        outcomeBullets:
          'Yapay zeka terminolojisini açıklama; uygun kullanım alanlarını ayırt etme; ilk iş senaryolarını değerlendirme.',
      },
      {
        slug: 'course-2',
        topicArea: 'yapay-zeka',
        level: 'orta',
        targetAudience: 'İş modeli, ürün ve inovasyon kararlarında yapay zekayı değerlendiren ekipler',
        businessValue:
          'Yapay zeka etkisini yalnızca teknoloji başlığı olarak değil, değer önerisi, operasyon ve gelir modeli üzerinden tartışmaya açar.',
        scopeSummary: 'AI destekli iş modeli fırsatları, operasyonel etki alanları, değer önerisi ve dönüşüm öncelikleri.',
        outcomeBullets:
          'AI fırsatlarını iş modeli diliyle ifade etme; dönüşüm önceliklerini sıralama; uygulanabilir ilk adımları belirleme.',
      },
      {
        slug: 'yapay-zeka-ile-is-modellerini-yeniden-dusunmek',
        topicArea: 'yapay-zeka',
        level: 'orta',
        targetAudience: 'Yöneticiler, ürün ekipleri, iş geliştirme ve dijital dönüşüm ekipleri',
        businessValue:
          'Yapay zekanın mevcut iş modellerini nasıl değiştirebileceğini görünür kılar ve kurum içi dönüşüm kararları için ortak çerçeve sağlar.',
        scopeSummary: 'AI trendleri, iş modeli etkileri, fırsat alanları, riskler ve uygulanabilir dönüşüm senaryoları.',
        outcomeBullets:
          'AI etkisini iş modeli üzerinden okuma; fırsat-risk dengesini kurma; kurum için öncelikli kullanım alanlarını seçme.',
      },
      {
        slug: 'istqb-temel-seviye-sertifikasyon-egitimi',
        topicArea: 'yazilim-gelistirme',
        level: 'temel',
        targetAudience: 'Test uzmanları, yazılım geliştiriciler, kalite ekipleri ve ISTQB sınavına hazırlanan profesyoneller',
        businessValue:
          'Test süreçlerinde ortak terminoloji ve yöntem disiplini oluşturarak kalite çalışmalarını daha ölçülebilir hale getirir.',
        scopeSummary: 'ISTQB temel kavramları, test yaşam döngüsü, test tasarımı, hata yönetimi ve sınav hazırlığı.',
        outcomeBullets:
          'ISTQB terminolojisini kullanma; test sürecini yapılandırma; temel test tekniklerini uygulama; sınav kapsamına hazırlanma.',
      },
      {
        slug: 'agile-yaklasim-ve-scrum-egitimi',
        topicArea: 'is-surecleri',
        level: 'temel',
        targetAudience: 'Ürün, proje, yazılım ve operasyon ekiplerinde çevik çalışma modeline geçmek isteyen ekipler',
        businessValue:
          'Ekiplerin çevik prensipleri doğru anlamasını, Scrum rollerini netleştirmesini ve teslim ritmini daha görünür yönetmesini sağlar.',
        scopeSummary: 'Agile prensipler, Scrum rolleri, etkinlikler, artefaktlar, sprint ritmi ve ekip içi çalışma alışkanlıkları.',
        outcomeBullets:
          'Scrum rollerini ayırt etme; sprint akışını kurma; çevik toplantıları amacına uygun yürütme; ekip içi şeffaflığı artırma.',
      },
      {
        slug: 'yapay-zeka-ile-iletisim-yontemleri',
        topicArea: 'yapay-zeka',
        level: 'temel',
        targetAudience: 'Kurumsal iletişim, satış, pazarlama, eğitim ve içerik üretimi ekipleri',
        businessValue:
          'Yapay zeka destekli iletişim araçlarının daha verimli ve kontrollü kullanılmasına yardımcı olur.',
        scopeSummary: 'Prompt yazımı, iletişim senaryoları, içerik üretimi, kalite kontrol ve etik kullanım ilkeleri.',
        outcomeBullets:
          'Daha net promptlar hazırlama; iletişim çıktısını değerlendirme; ekip içinde tekrar kullanılabilir yöntemler oluşturma.',
      },
      {
        slug: 'temel-seviye-yazilim-test-egitimi',
        topicArea: 'yazilim-gelistirme',
        level: 'temel',
        targetAudience: 'Yazılım testine yeni başlayanlar, geliştiriciler ve kalite süreçlerine katkı veren ekip üyeleri',
        businessValue:
          'Temel test disiplini kazandırarak hataların daha erken yakalanmasını ve teslim kalitesinin artmasını destekler.',
        scopeSummary: 'Test türleri, test senaryosu hazırlama, hata raporlama, manuel test pratikleri ve kalite yaklaşımı.',
        outcomeBullets:
          'Test senaryosu yazma; hata raporu oluşturma; temel test türlerini ayırt etme; kalite risklerini görünür kılma.',
      },
      {
        slug: 'egitmenlige-hazirlik-atolyesi',
        topicArea: 'is-surecleri',
        level: 'orta',
        targetAudience: 'Kurum içi uzmanlar, eğitmen adayları, teknik mentörler ve bilgi aktarımı yapan ekip liderleri',
        businessValue:
          'Uzman bilgisini yapılandırılmış, anlaşılır ve katılımcı odaklı bir eğitim deneyimine dönüştürür.',
        scopeSummary: 'Eğitim tasarımı, anlatım akışı, yetişkin öğrenmesi, uygulama planı ve geri bildirim yönetimi.',
        outcomeBullets:
          'Eğitim hedefi yazma; oturum akışı tasarlama; katılımcı etkileşimini yönetme; geri bildirimi geliştirmeye dönüştürme.',
      },
      {
        slug: 'cevik-test-uzmani-agile-tester-egitimi',
        topicArea: 'yazilim-gelistirme',
        level: 'orta',
        targetAudience: 'Agile ekiplerde çalışan test uzmanları, QA ekipleri ve yazılım geliştiriciler',
        businessValue:
          'Test yaklaşımını sprint ritmine uyumlu hale getirerek çevik ekiplerde kalite sorumluluğunu yaygınlaştırır.',
        scopeSummary: 'Agile test prensipleri, sprint içinde test planlama, otomasyon farkındalığı ve ekip içi kalite iş birliği.',
        outcomeBullets:
          'Sprint içinde test akışı kurma; çevik kalite risklerini belirleme; test ve geliştirme iş birliğini güçlendirme.',
      },
      {
        slug: 'veri-tabani-sql-egitimi',
        topicArea: 'veri-bilimi',
        level: 'temel',
        targetAudience: 'Veriyle çalışan iş birimleri, analistler, yazılım geliştiriciler ve raporlama ekipleri',
        businessValue:
          'Veriye erişim ve sorgulama yetkinliğini artırarak ekiplerin raporlama ve analiz ihtiyaçlarına daha hızlı cevap vermesini sağlar.',
        scopeSummary: 'İlişkisel veri modeli, temel SQL sorguları, filtreleme, birleştirme, gruplama ve pratik veri okuma.',
        outcomeBullets:
          'Temel SQL sorguları yazma; tabloları ilişkilendirme; veriyi filtreleme ve gruplama; raporlama ihtiyaçlarını analiz etme.',
      },
      {
        slug: 'scrum-master-egitimi',
        topicArea: 'is-surecleri',
        level: 'orta',
        targetAudience: 'Scrum Master adayları, çevik takım liderleri, ürün ve proje ekipleri',
        businessValue:
          'Scrum Master rolünü doğru konumlandırarak ekiplerin engelleri daha hızlı çözmesine ve çevik ritmi sürdürülebilir kılmasına yardım eder.',
        scopeSummary: 'Scrum Master sorumlulukları, fasilitasyon, engel yönetimi, takım dinamikleri ve çevik iyileştirme pratikleri.',
        outcomeBullets:
          'Scrum Master rolünü uygulama; ekip engellerini görünür kılma; retrospektif çıktıları aksiyona dönüştürme.',
      },
      {
        slug: 'cisco-sertifikali-ag-uzmani-egitimi-ccna',
        topicArea: 'bulut-altyapi',
        level: 'orta',
        targetAudience: 'Ağ uzmanı adayları, sistem yöneticileri, altyapı ve operasyon ekipleri',
        businessValue:
          'Ağ altyapısı bilgisini güçlendirerek operasyon ekiplerinin kurulum, yönetim ve sorun giderme kabiliyetini artırır.',
        scopeSummary: 'Ağ temelleri, yönlendirme, anahtarlama, IP adresleme, güvenlik temelleri ve CCNA sınav kapsamı.',
        outcomeBullets:
          'Ağ bileşenlerini açıklama; temel yapılandırmaları anlama; sorun giderme yaklaşımı kurma; CCNA kapsamına hazırlanma.',
      },
      {
        slug: 'bilgi-guvenligi-ve-etigi-egitimi',
        topicArea: 'siber-guvenlik',
        level: 'temel',
        targetAudience: 'Tüm çalışanlar, teknik ekipler, operasyon ekipleri ve güvenlik farkındalığını artırmak isteyen kurumlar',
        businessValue:
          'Bilgi güvenliği farkındalığını ve etik sorumluluğu güçlendirerek kurumsal risklerin azaltılmasına katkı sağlar.',
        scopeSummary: 'Bilgi güvenliği ilkeleri, veri koruma, sosyal mühendislik, etik kullanım ve çalışan sorumlulukları.',
        outcomeBullets:
          'Temel güvenlik risklerini tanıma; güvenli davranış alışkanlıkları geliştirme; etik sorumlulukları ayırt etme.',
      },
      {
        slug: 'cisco-sertifikali-ag-profesyoneli-ccnp',
        topicArea: 'bulut-altyapi',
        level: 'ileri',
        targetAudience: 'Deneyimli ağ uzmanları, altyapı mühendisleri ve ileri seviye sertifikasyon hedefleyen profesyoneller',
        businessValue:
          'Karmaşık ağ yapılarını yönetme ve ileri seviye sorun giderme becerilerini güçlendirir.',
        scopeSummary: 'İleri yönlendirme ve anahtarlama, ağ tasarımı, operasyonel sorun giderme ve CCNP kapsamı.',
        outcomeBullets:
          'İleri ağ kavramlarını uygulama; karmaşık sorunları analiz etme; operasyonel ağ kararlarını daha güvenle alma.',
      },
      {
        slug: 'linux-temelleri-egitimi',
        topicArea: 'bulut-altyapi',
        level: 'temel',
        targetAudience: 'Sistem yöneticileri, geliştiriciler, operasyon ekipleri ve Linux kullanmaya başlayacak profesyoneller',
        businessValue:
          'Linux ortamlarında temel çalışma becerisi kazandırarak altyapı ve uygulama operasyonlarının daha güvenli yürütülmesini sağlar.',
        scopeSummary: 'Linux komut satırı, dosya sistemi, kullanıcı ve yetki yönetimi, süreçler ve temel sistem araçları.',
        outcomeBullets:
          'Komut satırında çalışma; dosya ve yetki yönetimi yapma; temel sistem kontrollerini uygulama.',
      },
      {
        slug: 'temel-bankacilik-kavramlari-ve-uygulama-egitimi',
        topicArea: 'is-surecleri',
        level: 'temel',
        targetAudience: 'Bankacılık alanına yeni başlayan ekipler, yazılım ekipleri, operasyon ve iş analizi ekipleri',
        businessValue:
          'Bankacılık süreçleri için ortak kavram seti oluşturarak teknoloji ve iş ekipleri arasındaki iletişimi güçlendirir.',
        scopeSummary: 'Temel bankacılık kavramları, operasyonel süreçler, ürün yapıları ve uygulama örnekleri.',
        outcomeBullets:
          'Bankacılık terminolojisini kullanma; temel süreçleri açıklama; iş ve teknoloji ekipleri arasında ortak dil kurma.',
      },
    ],
  },
  {
    label: 'events',
    endpoint: 'events',
    fields: ['slug', 'topicArea', 'keepRegistrationsOpen'],
    source: [
      { slug: 'demo-data-platform-kickoff-session', topicArea: 'veri-bilimi' },
      { slug: 'demo-data-platform-architecture-lab', topicArea: 'veri-bilimi' },
      { slug: 'demo-ai-product-kickoff', topicArea: 'yapay-zeka' },
      { slug: 'demo-ai-evaluation-clinic', topicArea: 'yapay-zeka' },
      { slug: 'demo-cloud-ops-incident-drill', topicArea: 'bulut-altyapi', keepRegistrationsOpen: true },
      { slug: 'demo-cloud-ops-observability-lab', topicArea: 'bulut-altyapi' },
      { slug: 'demo-reliability-roundtable', topicArea: 'bulut-altyapi' },
      { slug: 'demo-frontend-systems-sprint-review', topicArea: 'yazilim-gelistirme' },
      { slug: 'ai-event-2', topicArea: 'yapay-zeka', keepRegistrationsOpen: false },
      { slug: 'arge-genel-muduru-welcome', topicArea: 'yazilim-gelistirme', keepRegistrationsOpen: true },
      { slug: 'arge-vizyonu-ve-teknoloji-trendleri-webinari', topicArea: 'yazilim-gelistirme', keepRegistrationsOpen: false },
      { slug: 'yapay-zeka-uygulamalari-egitimi', topicArea: 'yapay-zeka', keepRegistrationsOpen: false },
      { slug: 'inovasyon-kulturu-ve-proje-gelistirme-kursu', topicArea: 'is-surecleri', keepRegistrationsOpen: false },
      { slug: 'yapay-zeka-ile-degisen-hayatlar', topicArea: 'yapay-zeka', keepRegistrationsOpen: false },
      {
        slug: 'psikoloji-tasarim-deneyim-muhendisliginin-anatomisi',
        topicArea: 'is-surecleri',
        keepRegistrationsOpen: false,
      },
    ],
  },
  {
    label: 'teachers',
    endpoint: 'teachers',
    fields: ['slug', 'expertiseAreas', 'targetTeams', 'teachingApproach'],
    source: [
      {
        slug: 'demo-ayse-yilmaz',
        expertiseAreas: ['veri-muhendisligi', 'makine-ogrenmesi', 'analitik'],
        targetTeams: 'Veri muhendisligi ekipleri, analitik birimleri, urun yoneticileri',
        teachingApproach:
          'Uygulamali atolye calismalari ve gercek dunya senaryolari ile ogrenme. Katilimcilarin kendi projelerinden ornekler uzerinde calisarak ogrenmelerini tesvik eder.',
      },
      {
        slug: 'demo-mehmet-kara',
        expertiseAreas: ['bulut-altyapi', 'guvenilirlik-muhendisligi', 'gozlemlenebilirlik'],
        targetTeams: 'SRE ekipleri, platform muhendisleri, operasyon yoneticileri',
        teachingApproach:
          'Canli operasyonel tatbikatlar ve olay mudahale simulasyonlari ile ogrenme. Teoriyi kisa tutup, katilimcilari gercek basinc altinda karar almaya yonlendirir.',
      },
      {
        slug: 'demo-elif-demir',
        expertiseAreas: ['frontend-mimarisi', 'tasarim-sistemleri', 'erisilebilirlik'],
        targetTeams: 'Frontend gelistiriciler, tasarim sistem ekipleri, UI muhendisleri',
        teachingApproach:
          'Studyo formatinda yapilandirilmis uygulamali oturumlar. Tasarim kararlarini muhendislik kararlarina baglayan butunsel bir yaklasim benimser.',
      },
      {
        slug: 'alper-vahaplar',
        expertiseAreas: ['yapay-zeka', 'is-modeli', 'dijital-donusum'],
        targetTeams: 'Yonetim ekipleri, urun ekipleri, is gelistirme ve dijital donusum ekipleri',
        teachingApproach:
          'Stratejik cerceveleme, vaka tartismalari ve kurum ici uygulama senaryolariyla katilimcilarin kendi is modelleri uzerinden dusunmesini saglar.',
      },
      {
        slug: 'arda-eren',
        expertiseAreas: ['yapay-zeka', 'iletisim-yontemleri', 'egitim-teknolojileri'],
        targetTeams: 'Kurumsal iletisim, satis, pazarlama, egitim ve icerik uretimi ekipleri',
        teachingApproach:
          'Pratik ornekler, prompt calismalari ve ekiplerin kendi iletisim senaryolari uzerinden ilerleyen uygulamali bir anlatim benimser.',
      },
      {
        slug: 'cemal-taner',
        expertiseAreas: ['ag-altyapisi', 'cisco', 'siber-guvenlik'],
        targetTeams: 'Ag uzmanlari, sistem yoneticileri, altyapi ve operasyon ekipleri',
        teachingApproach:
          'Kavramlari ag mimarisi ve operasyonel sorun giderme pratikleriyle birlestirerek sertifikasyon hedefini gercek is senaryolariyla destekler.',
      },
      {
        slug: 'didem-colak-arslan',
        expertiseAreas: ['agile', 'scrum', 'cevik-test'],
        targetTeams: 'Urun, proje, yazilim, test ve cevik donusum ekipleri',
        teachingApproach:
          'Ekip rolleri, rituel tasarimi ve uygulamali calismalarla cevik prensipleri gunluk teslim pratiklerine baglar.',
      },
      {
        slug: 'ergul-inanc',
        expertiseAreas: ['yazilim-test', 'egitmenlik', 'ai-is-modelleri'],
        targetTeams: 'Test ekipleri, egitmen adaylari, is modeli ve kalite odakli ekipler',
        teachingApproach:
          'Temel kavramlari adim adim kuran, uygulama ve geri bildirimle pekistiren katilimci odakli bir egitim akisi kullanir.',
      },
      {
        slug: 'harun-duman',
        expertiseAreas: ['cisco', 'ag-profesyonelligi', 'ileri-ag-altyapisi'],
        targetTeams: 'Deneyimli ag uzmanlari, altyapi muhendisleri ve ileri seviye sertifikasyon adaylari',
        teachingApproach:
          'Ileri seviye ag konularini mimari kararlar ve sorun giderme senaryolariyla ele alarak profesyonel uygulama derinligi kazandirir.',
      },
      {
        slug: 'm-vedat-celikel',
        expertiseAreas: ['istqb', 'yazilim-test', 'bankacilik-surecleri'],
        targetTeams: 'Test uzmanlari, kalite ekipleri, bankacilik alaninda calisan is ve teknoloji ekipleri',
        teachingApproach:
          'Standart terminolojiyi pratik test ve is sureci ornekleriyle birlestirerek katilimcilarin ortak kavram seti kazanmasini hedefler.',
      },
      {
        slug: 'tayfun-suer',
        expertiseAreas: ['veri-tabani', 'sql', 'veri-analizi'],
        targetTeams: 'Analistler, raporlama ekipleri, yazilim gelistiriciler ve veriyle calisan is birimleri',
        teachingApproach:
          'SQL kavramlarini kademeli sorgu pratikleri ve gercek veri okuma ihtiyaclari uzerinden anlatir.',
      },
    ],
  },
  {
    label: 'blog authors',
    endpoint: 'blog-authors',
    fields: ['slug'],
    source: [
      { slug: 'demo-ayse-yilmaz' },
      { slug: 'demo-mehmet-kara' },
    ],
    readOnly: true,
  },
  {
    label: 'blog posts',
    endpoint: 'blog-posts',
    fields: ['slug', 'publishedDate', 'sourceNotes', 'author'],
    populate: ['author'],
    source: [
      {
        slug: 'demo-launching-the-academy-portal',
        publishedDate: '2025-12-15T10:00:00.000Z',
        sourceNotes: 'Internal editorial calendar Q4 2025',
        authorSlug: 'demo-ayse-yilmaz',
      },
      {
        slug: 'demo-why-event-linked-learning-matters',
        publishedDate: '2026-01-20T09:00:00.000Z',
        sourceNotes: 'Adapted from internal training documentation',
        authorSlug: 'demo-mehmet-kara',
      },
      {
        slug: 'demo-teacher-stories-from-the-field',
        publishedDate: '2026-02-10T11:00:00.000Z',
        sourceNotes: null,
        authorSlug: 'demo-ayse-yilmaz',
      },
      {
        slug: 'demo-preparing-for-your-first-live-session',
        publishedDate: '2026-03-05T08:00:00.000Z',
        sourceNotes: 'Compiled from student feedback surveys',
        authorSlug: 'demo-mehmet-kara',
      },
      {
        slug: 'blog-post-1',
        publishedDate: '2025-01-10T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'yapay-zeka',
        publishedDate: '2025-01-17T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'fpga-ve-geleneksel-islemciler-farklar-ve-avantajlar',
        publishedDate: '2025-01-24T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'iki-yillik-bir-sistem-muhendisligi-yolculugu',
        publishedDate: '2025-01-31T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'network-slicing-ag-dilimleme',
        publishedDate: '2025-02-07T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'agile-ve-scrum-calismalarinda-is-analisti-rolu',
        publishedDate: '2025-02-14T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'ulusal-dolasim-nedir',
        publishedDate: '2025-02-21T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'xshell-ile-sistemlerin-kontrolu',
        publishedDate: '2025-02-28T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'open-ran-open-radio-acces-network-acik-radyo-erisim-agi',
        publishedDate: '2025-03-07T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'savunma-ve-havacilik-sanayisinde-tasarim-kalite-guvence',
        publishedDate: '2025-03-14T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'agile-in-en-guclu-formulu-3-zihin-1-hedef',
        publishedDate: '2025-03-21T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'kalite-herkesin-sorumlulugudur-soylemi',
        publishedDate: '2025-03-28T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
      {
        slug: 'ai-caginda-test-uzmani-kodun-degil-kalitenin-koruyucusu',
        publishedDate: '2025-04-04T09:00:00.000Z',
        sourceNotes: 'Legacy SQL import; original published date unavailable.',
      },
    ],
  },
];

const result = {
  updated: 0,
  skipped: 0,
  missing: 0,
  failed: 0,
};

function buildUrl(path, params = {}) {
  const url = new URL(`${baseUrl}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
      continue;
    }

    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  return url;
}

function buildCollectionReadUrl(collection, page) {
  const params = {
    'pagination[page]': String(page),
    'pagination[pageSize]': String(PAGE_SIZE),
  };

  collection.fields.forEach((field, index) => {
    if (field !== 'author') {
      params[`fields[${index}]`] = field;
    }
  });

  if (collection.populate) {
    collection.populate.forEach((relation, index) => {
      params[`populate[${relation}][fields][0]`] = 'slug';
      params[`populate[${relation}][fields][1]`] = 'documentId';
      params[`populate[${relation}][fields][2]`] = 'displayName';
      params[`populate[${relation}][sort][${index}]`] = 'slug:asc';
    });
  }

  return buildUrl(`/api/${collection.endpoint}`, params);
}

function headers({ write = false } = {}) {
  const output = {};

  if (apiToken) {
    output.Authorization = `Bearer ${apiToken}`;
  }

  if (write) {
    output['Content-Type'] = 'application/json';
  }

  return output;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers({ write: options.method && options.method !== 'GET' }),
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }

  if (!response.ok) {
    const message = body?.error?.message || body?.raw || response.statusText;
    throw new Error(`${response.status} ${response.statusText}: ${message}`);
  }

  return body;
}

async function fetchCollection(collection) {
  const entries = [];
  let page = 1;
  let pageCount = 1;

  do {
    const body = await requestJson(buildCollectionReadUrl(collection, page));
    entries.push(...(body.data || []));
    pageCount = body.meta?.pagination?.pageCount || 1;
    page += 1;
  } while (page <= pageCount);

  return entries;
}

function isMissing(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

function getDocumentId(entry) {
  return entry.documentId || entry.id;
}

function buildIndex(entries) {
  return new Map(entries.map((entry) => [entry.slug, entry]));
}

function formatFields(data) {
  return Object.keys(data).sort().join(', ');
}

async function updateEntry(collection, entry, data) {
  const documentId = getDocumentId(entry);

  if (!documentId) {
    throw new Error(`Missing documentId for ${collection.endpoint}/${entry.slug}`);
  }

  await requestJson(buildUrl(`/api/${collection.endpoint}/${documentId}`), {
    method: 'PUT',
    body: JSON.stringify({ data }),
  });
}

function resolveBlogPostPatch(source, liveEntry, authorBySlug) {
  const patch = {};

  if (isMissing(liveEntry.publishedDate) && !isMissing(source.publishedDate)) {
    patch.publishedDate = source.publishedDate;
  }

  if (isMissing(liveEntry.sourceNotes) && !isMissing(source.sourceNotes)) {
    patch.sourceNotes = source.sourceNotes;
  }

  if (isMissing(liveEntry.author) && source.authorSlug) {
    const author = authorBySlug.get(source.authorSlug);

    if (author) {
      patch.author = getDocumentId(author);
    }
  }

  return patch;
}

function resolvePatch(collection, source, liveEntry, context) {
  if (collection.endpoint === 'blog-posts') {
    return resolveBlogPostPatch(source, liveEntry, context.authorBySlug);
  }

  return collection.fields.reduce((patch, field) => {
    if (field === 'slug') {
      return patch;
    }

    if (isMissing(liveEntry[field]) && !isMissing(source[field])) {
      patch[field] = source[field];
    }

    return patch;
  }, {});
}

async function processCollection(collection, context) {
  if (collection.readOnly) {
    return;
  }

  const liveEntries = context.entriesByEndpoint.get(collection.endpoint) || [];
  const liveBySlug = buildIndex(liveEntries);

  console.log(`\n${collection.label}`);

  for (const source of collection.source) {
    const liveEntry = liveBySlug.get(source.slug);

    if (!liveEntry) {
      result.missing += 1;
      console.log(`  missing ${source.slug}`);
      continue;
    }

    const patch = resolvePatch(collection, source, liveEntry, context);

    if (Object.keys(patch).length === 0) {
      result.skipped += 1;
      console.log(`  skipped ${source.slug}`);
      continue;
    }

    if (dryRun) {
      result.skipped += 1;
      console.log(`  dry-run ${source.slug}: ${formatFields(patch)}`);
      continue;
    }

    try {
      await updateEntry(collection, liveEntry, patch);
      result.updated += 1;
      console.log(`  updated ${source.slug}: ${formatFields(patch)}`);
    } catch (error) {
      result.failed += 1;
      console.error(`  failed ${source.slug}: ${error.message}`);
    }
  }
}

async function main() {
  if (!dryRun && !apiToken) {
    throw new Error('STRAPI_API_TOKEN is required when DRY_RUN=false');
  }

  console.log(`Backfill target: ${baseUrl}`);
  console.log(`Mode: ${dryRun ? 'dry-run' : 'write'}`);

  const entriesByEndpoint = new Map();

  for (const collection of collections) {
    const entries = await fetchCollection(collection);
    entriesByEndpoint.set(collection.endpoint, entries);
  }

  const authorBySlug = buildIndex(entriesByEndpoint.get('blog-authors') || []);
  const context = { authorBySlug, entriesByEndpoint };

  for (const collection of collections) {
    await processCollection(collection, context);
  }

  console.log('\nBackfill summary');
  console.table(result);

  if (result.failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('\nBackfill failed.');
  console.error(error.message);
  process.exit(1);
});
