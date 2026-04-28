'use strict';

const { compileStrapi, createStrapi } = require('@strapi/strapi');
const { ensureNotificationRoutingSeedDefaults } = require('./notification-routing-seed');

const createSummary = () => ({
  notificationRoutings: { created: 0, updated: 0 },
  teachers: { created: 0, updated: 0 },
  courses: { created: 0, updated: 0 },
  events: { created: 0, updated: 0 },
  blogPosts: { created: 0, updated: 0 },
  students: { created: 0, updated: 0 },
  registrations: { created: 0, updated: 0 },
});

const demoNotificationRoutings = [
  {
    key: 'contact_submission',
    label: 'Iletisim Formu Bildirimi',
    enabled: true,
    customEmails: ['demo.notifications@netas-academy.local'],
  },
  {
    key: 'event_registration',
    label: 'Etkinlik Kayit Bildirimi',
    enabled: true,
    customEmails: ['demo.events@netas-academy.local'],
  },
];

const demoTeachers = [
  {
    slug: 'demo-ayse-yilmaz',
    fullName: 'Demo: Ayse Yilmaz',
    headline: 'Lead instructor for data and AI programs',
    bio: 'Ayse leads data strategy, analytics, and machine learning education for enterprise teams.',
    email: 'demo.ayse.yilmaz@netas-academy.local',
  },
  {
    slug: 'demo-mehmet-kara',
    fullName: 'Demo: Mehmet Kara',
    headline: 'Cloud operations and platform engineering trainer',
    bio: 'Mehmet teaches resilient cloud delivery, observability, and production readiness practices.',
    email: 'demo.mehmet.kara@netas-academy.local',
  },
  {
    slug: 'demo-elif-demir',
    fullName: 'Demo: Elif Demir',
    headline: 'Frontend systems and product delivery mentor',
    bio: 'Elif focuses on modern frontend architecture, design systems, and developer experience.',
    email: 'demo.elif.demir@netas-academy.local',
  },
];

const demoCourses = [
  {
    slug: 'demo-data-platform-fundamentals',
    title: 'Demo: Data Platform Fundamentals',
    summary: 'A practical introduction to modern data platform concepts, team workflows, and delivery habits.',
    description: [
      '<p>This demo course turns platform thinking into a clear learning path for teams building dependable data products.</p>',
      '<p>Participants move through <strong>data contracts</strong>, <strong>ingestion patterns</strong>, and <strong>analytics delivery</strong> decisions with concrete examples that mirror real project work.</p>',
      '<ul><li>Define shared ownership across data producers and consumers.</li><li>Compare ingestion approaches for batch and near-real-time flows.</li><li>Use lightweight checkpoints to keep analytics delivery healthy.</li></ul>',
    ].join(''),
    topicArea: 'veri-bilimi',
    level: 'temel',
    targetAudience: 'Veri mühendisleri, analitik ekipleri, ürün yöneticileri',
    businessValue: 'Ekiplerinizin veri platformu kararlarını daha hızlı ve güvenle almasını sağlayın. Bu program, veri ürünleri tesliminde tekrar eden hataları azaltır ve paydaşlar arası ortak dili güçlendirir.',
    scopeSummary: 'Veri sözleşmeleri, ingestion desenleri, analitik teslim döngüsü ve ekip içi sahiplik modeli.',
    outcomeBullets: 'Veri üreticisi-tüketicisi arasında net sözleşme; batch/stream ingestion karşılaştırması; sağlıklı analitik teslim kontrol noktaları.',
    teacherSlug: 'demo-ayse-yilmaz',
  },
  {
    slug: 'demo-applied-ai-for-product-teams',
    title: 'Demo: Applied AI for Product Teams',
    summary: 'Hands-on AI literacy for teams shipping product features, internal tools, and decision support workflows.',
    description: [
      '<p>This course gives product, design, and engineering teams a shared language for working with AI in production.</p>',
      '<p>The program covers <strong>prompt design</strong>, <strong>evaluation loops</strong>, and <strong>responsible rollout patterns</strong> so participants can move from experiments to reliable delivery.</p>',
      '<p><strong>Expected outcomes:</strong> clearer feature framing, faster iteration cycles, and better collaboration around AI-assisted products.</p>',
    ].join(''),
    topicArea: 'yapay-zeka',
    level: 'orta',
    targetAudience: 'Ürün yöneticileri, yazılım geliştiriciler, tasarım ekipleri',
    businessValue: 'Yapay zeka destekli ürün özelliklerini deney aşamasından güvenilir teslime taşıyın. Bu eğitim, ekiplerin prompt tasarımı, değerlendirme döngüleri ve sorumlu yaygınlaştırma konularında ortak bir dil geliştirmesini sağlar.',
    scopeSummary: 'Prompt tasarımı, değerlendirme döngüleri, sorumlu AI yaygınlaştırma ve ürün ekipleri için pratik AI okuryazarlığı.',
    outcomeBullets: 'Daha net özellik çerçeveleme; hızlı iterasyon döngüleri; AI destekli ürünlerde ekip içi iş birliği.',
    teacherSlug: 'demo-ayse-yilmaz',
  },
  {
    slug: 'demo-cloud-operations-bootcamp',
    title: 'Demo: Cloud Operations Bootcamp',
    summary: 'Operational readiness for teams managing critical cloud systems and release pipelines.',
    description: [
      '<p>A delivery-focused course for teams responsible for runtime stability, service health, and deployment safety.</p>',
      '<p>We work through <strong>runtime visibility</strong>, <strong>incident response</strong>, and <strong>platform ownership</strong> using practical scenarios that mirror production pressure.</p>',
      '<ul><li>Build a monitoring view that surfaces signals before incidents escalate.</li><li>Design safer deployment checkpoints for critical services.</li><li>Clarify who owns response, recovery, and post-incident follow-up.</li></ul>',
    ].join(''),
    topicArea: 'bulut-altyapi',
    level: 'orta',
    targetAudience: 'SRE ekipleri, platform mühendisleri, operasyon yöneticileri',
    businessValue: 'Kritik bulut sistemlerinizin çalışma zamanı kararlılığını artırın. Bu bootcamp, olay müdahalesi, dağıtım güvenliği ve servis sağlığı izleme konularında ekibinize operasyonel refleks kazandırır.',
    scopeSummary: 'Çalışma zamanı görünürlüğü, olay müdahalesi, platform sahipliği, dağıtım kontrol noktaları.',
    outcomeBullets: 'Olaylar yükselmeden sinyal yakalama; kritik servisler için güvenli dağıtım; net müdahale ve kurtarma sahipliği.',
    teacherSlug: 'demo-mehmet-kara',
  },
  {
    slug: 'demo-platform-reliability-workshop',
    title: 'Demo: Platform Reliability Workshop',
    summary: 'Reliability practices for engineering managers and senior technical teams building shared services.',
    description: [
      '<p>This workshop is designed for teams balancing reliability goals, product velocity, and cross-functional coordination.</p>',
      '<p>Topics include <strong>SLO design</strong>, <strong>failure budgets</strong>, <strong>service health signals</strong>, and the operating rhythm needed to keep ownership visible.</p>',
      '<p><strong>Workshop format:</strong> short theory blocks, guided exercises, and a final review of actionable operational changes.</p>',
    ].join(''),
    topicArea: 'bulut-altyapi',
    level: 'ileri',
    targetAudience: 'Mühendislik yöneticileri, kıdemli teknik ekipler, platform sahipleri',
    businessValue: 'Güvenilirlik hedefleri ile ürün hızı arasındaki dengeyi kurumsal ölçekte yönetin. Bu atölye, SLO tasarımı, hata bütçeleri ve servis sağlığı sinyalleriyle ekiplerinizin operasyonel olgunluğunu artırır.',
    scopeSummary: 'SLO tasarımı, hata bütçeleri, servis sağlığı sinyalleri, çapraz fonksiyonlu koordinasyon ve operasyonel ritim.',
    outcomeBullets: 'Ölçülebilir güvenilirlik hedefleri; hata bütçesi tabanlı karar mekanizması; aksiyona dönüşebilir operasyonel değişiklik planı.',
    teacherSlug: 'demo-mehmet-kara',
  },
  {
    slug: 'demo-frontend-systems-studio',
    title: 'Demo: Frontend Systems Studio',
    summary: 'A structured program for building durable design systems and frontend delivery workflows.',
    description: [
      '<p>The studio format helps frontend teams turn UI standards into a shared production workflow rather than a one-off design exercise.</p>',
      '<p>Sessions focus on <strong>component architecture</strong>, <strong>UI consistency</strong>, <strong>accessibility</strong>, and <strong>release-safe collaboration</strong>.</p>',
      '<ul><li>Set a clearer component boundary between product areas.</li><li>Improve accessibility checks before release.</li><li>Keep design and engineering decisions aligned as the system grows.</li></ul>',
    ].join(''),
    topicArea: 'yazilim-gelistirme',
    level: 'orta',
    targetAudience: 'Frontend geliştiriciler, tasarım sistem ekipleri, UI mühendisleri',
    businessValue: 'UI standartlarını tek seferlik bir tasarım çalışması olmaktan çıkarıp sürdürülebilir bir üretim iş akışına dönüştürün. Bu stüdyo programı, bileşen mimarisi, erişilebilirlik ve yayın güvenliği konularında ekibinize yapısal yetkinlik kazandırır.',
    scopeSummary: 'Bileşen mimarisi, UI tutarlılığı, erişilebilirlik kontrolleri, yayın güvenli iş birliği ve tasarım-mühendislik hizalaması.',
    outcomeBullets: 'Ürün alanları arasında net bileşen sınırları; yayın öncesi erişilebilirlik kontrolü; büyüyen sistemde uyumlu tasarım-mühendislik kararları.',
    teacherSlug: 'demo-elif-demir',
  },
];

const demoEvents = [
  {
    slug: 'demo-data-platform-kickoff-session',
    title: 'Demo: Data Platform Kickoff Session',
    summary: 'Course kickoff for platform foundations, shared expectations, and stakeholder alignment.',
    details: [
      '<p>This opening session frames the course agenda and aligns the team around what a healthy data platform should support.</p>',
      '<p>We introduce the learning path, review the first practical exercises, and set a common vocabulary for the rest of the program.</p>',
      '<ul><li>Program overview and delivery rhythm</li><li>Stakeholder questions and scope alignment</li><li>First hands-on exercise briefing</li></ul>',
    ].join(''),
    startsAt: '2026-04-15T09:00:00.000Z',
    eventType: 'kurs',
    endsAt: '2026-04-15T12:00:00.000Z',
    location: 'Istanbul Campus / Room 3A',
    topicArea: 'veri-bilimi',
    courseSlug: 'demo-data-platform-fundamentals',
  },
  {
    slug: 'demo-data-platform-architecture-lab',
    title: 'Demo: Data Platform Architecture Lab',
    summary: 'A focused working session on platform boundaries, ingestion design, and ownership.',
    details: [
      '<p>Teams sketch the ingestion architecture together and identify the decision points that usually cause confusion later in delivery.</p>',
      '<p>The lab emphasizes clear boundaries, practical handoffs, and the tradeoffs between velocity and long-term maintainability.</p>',
      '<p><strong>In-session activities:</strong> architecture sketching, ownership mapping, and a short review of failure points.</p>',
    ].join(''),
    startsAt: '2026-04-22T09:00:00.000Z',
    eventType: 'egitim',
    endsAt: '2026-04-22T12:30:00.000Z',
    location: 'Istanbul Campus / Lab 2',
    topicArea: 'veri-bilimi',
    courseSlug: 'demo-data-platform-fundamentals',
  },
  {
    slug: 'demo-ai-product-kickoff',
    title: 'Demo: AI Product Kickoff',
    summary: 'Launch session for product managers and builders exploring practical AI delivery patterns.',
    details: [
      '<p>This kickoff session is built for teams moving from curiosity to execution on AI-assisted product ideas.</p>',
      '<p>We cover goals, use-case framing, evaluation, and responsible delivery basics so the team can move forward with a shared plan.</p>',
      '<ul><li>What problems are worth solving with AI?</li><li>How do we evaluate quality before launch?</li><li>What does a responsible rollout look like?</li></ul>',
    ].join(''),
    startsAt: '2026-05-05T10:00:00.000Z',
    eventType: 'kurs',
    endsAt: '2026-05-05T13:00:00.000Z',
    location: 'Online Live Session',
    topicArea: 'yapay-zeka',
    courseSlug: 'demo-applied-ai-for-product-teams',
  },
  {
    slug: 'demo-ai-evaluation-clinic',
    title: 'Demo: AI Evaluation Clinic',
    summary: 'Workshop on testing AI behavior, improving output quality, and tightening feedback loops.',
    details: [
      '<p>Attendees bring draft use cases and work through a lightweight evaluation loop that can be reused after the workshop.</p>',
      '<p>The clinic is intentionally hands-on: teams inspect outputs, compare edge cases, and agree on quality signals that matter.</p>',
      '<p><strong>Outcome:</strong> a small but actionable evaluation plan for the next iteration cycle.</p>',
    ].join(''),
    startsAt: '2026-05-12T10:00:00.000Z',
    eventType: 'egitim',
    endsAt: '2026-05-12T12:00:00.000Z',
    location: 'Online Live Session',
    topicArea: 'yapay-zeka',
    courseSlug: 'demo-applied-ai-for-product-teams',
  },
  {
    slug: 'demo-cloud-ops-incident-drill',
    title: 'Demo: Cloud Ops Incident Drill',
    summary: 'A live operational drill for incident response, communication, and escalation flow.',
    details: [
      '<p>This drill simulates a production event and tests how the team responds under time pressure.</p>',
      '<p>Participants exercise monitoring, ownership, and escalation flow while keeping communication clear and structured.</p>',
      '<ul><li>Detect the incident from observable signals</li><li>Assign a clear response owner</li><li>Practice status updates and recovery steps</li></ul>',
    ].join(''),
    startsAt: '2026-03-11T09:00:00.000Z',
    eventType: 'egitim',
    endsAt: '2026-03-11T12:00:00.000Z',
    location: 'Ankara Office / Operations Room',
    keepRegistrationsOpen: true,
    topicArea: 'bulut-altyapi',
    courseSlug: 'demo-cloud-operations-bootcamp',
  },
  {
    slug: 'demo-cloud-ops-observability-lab',
    title: 'Demo: Cloud Ops Observability Lab',
    summary: 'A workshop on metrics, alerts, and actionable operational visibility.',
    details: [
      '<p>Participants review common alerting mistakes and tune an example monitoring setup with practical constraints in mind.</p>',
      '<p>The session focuses on signal quality, noisy alerts, and the dashboards that help operators make faster decisions.</p>',
      '<p><strong>Hands-on focus:</strong> reduce alert fatigue, sharpen key metrics, and tighten the feedback loop between observation and action.</p>',
    ].join(''),
    startsAt: '2026-05-21T09:00:00.000Z',
    eventType: 'egitim',
    endsAt: '2026-05-21T12:00:00.000Z',
    location: 'Ankara Office / Lab 1',
    topicArea: 'bulut-altyapi',
    courseSlug: 'demo-cloud-operations-bootcamp',
  },
  {
    slug: 'demo-reliability-roundtable',
    title: 'Demo: Reliability Roundtable',
    summary: 'Discussion-oriented event for reliability strategy, executive alignment, and operating rhythm.',
    details: [
      '<p>This roundtable brings together technical leaders to align on reliability tradeoffs and the operating rhythm needed to support them.</p>',
      '<p>The discussion is intentionally strategic: participants compare practices, surface constraints, and clarify the decisions that need executive support.</p>',
      '<p><strong>Format:</strong> moderated discussion, shared notes, and a short action review at the end.</p>',
    ].join(''),
    startsAt: '2026-04-29T13:00:00.000Z',
    eventType: 'etkinlik',
    endsAt: '2026-04-29T15:00:00.000Z',
    location: 'Executive Briefing Room',
    topicArea: 'bulut-altyapi',
    courseSlug: 'demo-platform-reliability-workshop',
  },
  {
    slug: 'demo-frontend-systems-sprint-review',
    title: 'Demo: Frontend Systems Sprint Review',
    summary: 'Review session for component systems, accessibility decisions, and shared UI delivery.',
    details: [
      '<p>Teams review the current component system, accessibility choices, and the rollout considerations that affect shared UI delivery.</p>',
      '<p>The review is a practical checkpoint for keeping product teams aligned while the frontend system continues to evolve.</p>',
      '<ul><li>Pattern review and feedback</li><li>Accessibility follow-up items</li><li>Rollout and adoption risks</li></ul>',
    ].join(''),
    startsAt: '2026-04-18T11:00:00.000Z',
    eventType: 'etkinlik',
    endsAt: '2026-04-18T13:30:00.000Z',
    location: 'Istanbul Campus / Studio',
    topicArea: 'yazilim-gelistirme',
    courseSlug: 'demo-frontend-systems-studio',
  },
];

const demoBlogPosts = [
  {
    slug: 'demo-launching-the-academy-portal',
    title: 'Demo: Launching the Academy Portal',
    excerpt: 'A sample editorial entry announcing the academy portal and its learning catalog.',
    content:
      'This demo blog post exists so editors and frontend developers can test listing pages, detail pages, and featured content slots.',
  },
  {
    slug: 'demo-why-event-linked-learning-matters',
    title: 'Demo: Why Event-Linked Learning Matters',
    excerpt: 'Explains how courses and events work together in the academy model.',
    content:
      'This sample article highlights how structured learning journeys benefit from linked live events and reusable course context.',
  },
  {
    slug: 'demo-teacher-stories-from-the-field',
    title: 'Demo: Teacher Stories From the Field',
    excerpt: 'Example editorial content focusing on instructors and their delivery approach.',
    content:
      'Use this record to validate teaser cards, detail layouts, and editor workflows for long-form teacher-related content.',
  },
  {
    slug: 'demo-preparing-for-your-first-live-session',
    title: 'Demo: Preparing for Your First Live Session',
    excerpt: 'A practical checklist post for students and participants before an event.',
    content:
      'This sample post is intentionally realistic enough to test copy-heavy templates and editorial preview behavior.',
  },
];

const demoStudents = [
  { firstName: 'Ada', lastName: 'Kaya', email: 'demo.ada.kaya@example.com', phone: '+90 555 000 1001' },
  { firstName: 'Mert', lastName: 'Arslan', email: 'demo.mert.arslan@example.com', phone: '+90 555 000 1002' },
  { firstName: 'Zeynep', lastName: 'Celik', email: 'demo.zeynep.celik@example.com', phone: '+90 555 000 1003' },
  { firstName: 'Burak', lastName: 'Sen', email: 'demo.burak.sen@example.com', phone: '+90 555 000 1004' },
  { firstName: 'Selin', lastName: 'Aydin', email: 'demo.selin.aydin@example.com', phone: '+90 555 000 1005' },
  { firstName: 'Kerem', lastName: 'Demir', email: 'demo.kerem.demir@example.com', phone: '+90 555 000 1006' },
  { firstName: 'Ece', lastName: 'Yildiz', email: 'demo.ece.yildiz@example.com', phone: '+90 555 000 1007' },
  { firstName: 'Can', lastName: 'Tas', email: 'demo.can.tas@example.com', phone: '+90 555 000 1008' },
  { firstName: 'Derya', lastName: 'Koc', email: 'demo.derya.koc@example.com', phone: '+90 555 000 1009' },
  { firstName: 'Onur', lastName: 'Eren', email: 'demo.onur.eren@example.com', phone: '+90 555 000 1010' },
  { firstName: 'Naz', lastName: 'Aksoy', email: 'demo.naz.aksoy@example.com', phone: '+90 555 000 1011' },
  { firstName: 'Emre', lastName: 'Topal', email: 'demo.emre.topal@example.com', phone: '+90 555 000 1012' },
];

const demoRegistrations = [
  { studentEmail: 'demo.ada.kaya@example.com', eventSlug: 'demo-ai-product-kickoff', status: 'confirmed', notes: 'Interested in AI feature delivery.' },
  { studentEmail: 'demo.mert.arslan@example.com', eventSlug: 'demo-ai-product-kickoff', status: 'confirmed' },
  { studentEmail: 'demo.zeynep.celik@example.com', eventSlug: 'demo-ai-product-kickoff', status: 'pending' },
  { studentEmail: 'demo.burak.sen@example.com', eventSlug: 'demo-ai-product-kickoff', status: 'pending' },
  { studentEmail: 'demo.selin.aydin@example.com', eventSlug: 'demo-ai-product-kickoff', status: 'waitlisted' },
  { studentEmail: 'demo.kerem.demir@example.com', eventSlug: 'demo-ai-product-kickoff', status: 'confirmed' },
  { studentEmail: 'demo.mert.arslan@example.com', eventSlug: 'demo-data-platform-kickoff-session', status: 'confirmed' },
  { studentEmail: 'demo.ece.yildiz@example.com', eventSlug: 'demo-data-platform-kickoff-session', status: 'pending' },
  { studentEmail: 'demo.can.tas@example.com', eventSlug: 'demo-data-platform-kickoff-session', status: 'waitlisted' },
  { studentEmail: 'demo.derya.koc@example.com', eventSlug: 'demo-cloud-ops-incident-drill', status: 'attended' },
  { studentEmail: 'demo.onur.eren@example.com', eventSlug: 'demo-cloud-ops-incident-drill', status: 'attended' },
  { studentEmail: 'demo.naz.aksoy@example.com', eventSlug: 'demo-cloud-ops-incident-drill', status: 'confirmed' },
  { studentEmail: 'demo.ada.kaya@example.com', eventSlug: 'demo-frontend-systems-sprint-review', status: 'confirmed' },
  { studentEmail: 'demo.zeynep.celik@example.com', eventSlug: 'demo-frontend-systems-sprint-review', status: 'cancelled' },
  { studentEmail: 'demo.emre.topal@example.com', eventSlug: 'demo-frontend-systems-sprint-review', status: 'pending' },
  { studentEmail: 'demo.burak.sen@example.com', eventSlug: 'demo-reliability-roundtable', status: 'attended' },
  { studentEmail: 'demo.selin.aydin@example.com', eventSlug: 'demo-reliability-roundtable', status: 'confirmed' },
  { studentEmail: 'demo.kerem.demir@example.com', eventSlug: 'demo-reliability-roundtable', status: 'waitlisted' },
];

async function upsertPublishedDocument(strapi, uid, uniqueField, uniqueValue, data, result, summaryKey) {
  const existing = await strapi.db.query(uid).findOne({
    where: { [uniqueField]: uniqueValue },
    select: ['documentId', uniqueField],
  });

  let entry;

  if (existing && existing.documentId) {
    entry = await strapi.documents(uid).update({
      documentId: existing.documentId,
      data,
    });
    result[summaryKey].updated += 1;
  } else {
    entry = await strapi.documents(uid).create({ data });
    result[summaryKey].created += 1;
  }

  await strapi.documents(uid).publish({ documentId: entry.documentId });

  return entry;
}

async function upsertStudent(strapi, student, result) {
  const email = student.email.trim().toLowerCase();
  const existing = await strapi.db.query('api::student.student').findOne({
    where: { email },
    select: ['id'],
  });

  const entry = await strapi.service('api::student.student').upsertByEmail({
    ...student,
    email,
  });

  result.students[existing ? 'updated' : 'created'] += 1;

  return entry;
}

async function upsertRegistration(strapi, registration, studentIdByEmail, eventIdBySlug, result) {
  const studentId = studentIdByEmail.get(registration.studentEmail);
  const eventId = eventIdBySlug.get(registration.eventSlug);

  if (!studentId) {
    throw new Error(`Missing student for registration: ${registration.studentEmail}`);
  }

  if (!eventId) {
    throw new Error(`Missing event for registration: ${registration.eventSlug}`);
  }

  const existing = await strapi.db.query('api::registration.registration').findOne({
    where: {
      student: { id: studentId },
      event: { id: eventId },
    },
    select: ['id'],
  });

  if (existing && existing.id) {
    await strapi.db.query('api::registration.registration').update({
      where: { id: existing.id },
      data: {
        status: registration.status,
        notes: registration.notes || null,
        student: studentId,
        event: eventId,
      },
    });
    result.registrations.updated += 1;
    return;
  }

  await strapi.db.query('api::registration.registration').create({
    data: {
      status: registration.status,
      notes: registration.notes || null,
      student: studentId,
      event: eventId,
    },
  });
  result.registrations.created += 1;
}

function printSummary(result) {
  const rows = Object.entries(result).map(([model, counts]) => ({
    model,
    created: counts.created,
    updated: counts.updated,
  }));

  console.log('\nDemo seed completed.\n');
  console.table(rows);
}

async function main() {
  const result = createSummary();
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    await ensureNotificationRoutingSeedDefaults(app, demoNotificationRoutings, result);

    const teacherDocumentIds = new Map();
    const courseDocumentIds = new Map();

    for (const teacher of demoTeachers) {
      const entry = await upsertPublishedDocument(
        app,
        'api::teacher.teacher',
        'slug',
        teacher.slug,
        teacher,
        result,
        'teachers'
      );

      teacherDocumentIds.set(teacher.slug, entry.documentId);
    }

    for (const course of demoCourses) {
      const teacherDocumentId = teacherDocumentIds.get(course.teacherSlug);

      if (!teacherDocumentId) {
        throw new Error(`Missing teacher document for course: ${course.slug}`);
      }

      const entry = await upsertPublishedDocument(
        app,
        'api::course.course',
        'slug',
        course.slug,
        {
          title: course.title,
          slug: course.slug,
          summary: course.summary,
          description: course.description,
          topicArea: course.topicArea,
          level: course.level,
          targetAudience: course.targetAudience,
          businessValue: course.businessValue,
          scopeSummary: course.scopeSummary,
          outcomeBullets: course.outcomeBullets,
          teacher: teacherDocumentId,
        },
        result,
        'courses'
      );

      courseDocumentIds.set(course.slug, entry.documentId);
    }

    for (const event of demoEvents) {
      const courseDocumentId = courseDocumentIds.get(event.courseSlug);

      if (!courseDocumentId) {
        throw new Error(`Missing course document for event: ${event.slug}`);
      }

      await upsertPublishedDocument(
        app,
        'api::event.event',
        'slug',
        event.slug,
        {
          title: event.title,
          slug: event.slug,
          summary: event.summary,
          details: event.details,
          startsAt: event.startsAt,
          eventType: event.eventType,
          endsAt: event.endsAt,
          keepRegistrationsOpen: event.keepRegistrationsOpen,
          location: event.location,
          topicArea: event.topicArea,
          course: courseDocumentId,
        },
        result,
        'events'
      );
    }

    for (const post of demoBlogPosts) {
      await upsertPublishedDocument(
        app,
        'api::blog-post.blog-post',
        'slug',
        post.slug,
        post,
        result,
        'blogPosts'
      );
    }

    const studentIdByEmail = new Map();

    for (const student of demoStudents) {
      const entry = await upsertStudent(app, student, result);
      studentIdByEmail.set(student.email.trim().toLowerCase(), entry.id);
    }

    const eventIdBySlug = new Map();

    for (const event of demoEvents) {
      const entry = await app.db.query('api::event.event').findOne({
        where: { slug: event.slug },
        select: ['id', 'slug'],
      });

      if (!entry || !entry.id) {
        throw new Error(`Missing event entity for registrations: ${event.slug}`);
      }

      eventIdBySlug.set(event.slug, entry.id);
    }

    for (const registration of demoRegistrations) {
      await upsertRegistration(app, registration, studentIdByEmail, eventIdBySlug, result);
    }

    printSummary(result);
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error('\nDemo seed failed.\n');
  console.error(error);
  process.exit(1);
});
