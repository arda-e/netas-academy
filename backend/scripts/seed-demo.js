'use strict';

const { compileStrapi, createStrapi } = require('@strapi/strapi');

const createSummary = () => ({
  teachers: { created: 0, updated: 0 },
  courses: { created: 0, updated: 0 },
  events: { created: 0, updated: 0 },
  blogPosts: { created: 0, updated: 0 },
  students: { created: 0, updated: 0 },
  registrations: { created: 0, updated: 0 },
});

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
    summary: 'A practical introduction to modern data platform concepts and team workflows.',
    description:
      'This demo course covers platform thinking, data contracts, ingestion patterns, and healthy analytics delivery habits.',
    teacherSlug: 'demo-ayse-yilmaz',
  },
  {
    slug: 'demo-applied-ai-for-product-teams',
    title: 'Demo: Applied AI for Product Teams',
    summary: 'Hands-on AI literacy for teams shipping product features and internal tools.',
    description:
      'Participants learn prompt design, evaluation loops, responsible rollout patterns, and team collaboration around AI features.',
    teacherSlug: 'demo-ayse-yilmaz',
  },
  {
    slug: 'demo-cloud-operations-bootcamp',
    title: 'Demo: Cloud Operations Bootcamp',
    summary: 'Operational readiness for teams managing critical cloud systems.',
    description:
      'A delivery-focused course covering runtime visibility, deployment safety, incident response, and platform ownership.',
    teacherSlug: 'demo-mehmet-kara',
  },
  {
    slug: 'demo-platform-reliability-workshop',
    title: 'Demo: Platform Reliability Workshop',
    summary: 'Reliability practices for engineering managers and senior technical teams.',
    description:
      'This workshop explores SLO design, failure budgets, service health signals, and cross-team operational coordination.',
    teacherSlug: 'demo-mehmet-kara',
  },
  {
    slug: 'demo-frontend-systems-studio',
    title: 'Demo: Frontend Systems Studio',
    summary: 'A structured program for building durable design systems and frontend delivery workflows.',
    description:
      'The course includes component architecture, UI consistency, accessibility, and release-safe frontend collaboration.',
    teacherSlug: 'demo-elif-demir',
  },
];

const demoEvents = [
  {
    slug: 'demo-data-platform-kickoff-session',
    title: 'Demo: Data Platform Kickoff Session',
    summary: 'Course kickoff for platform foundations and stakeholder alignment.',
    details: 'Introduces the program, the learning path, and the first practical exercises.',
    startsAt: '2026-04-15T09:00:00.000Z',
    endsAt: '2026-04-15T12:00:00.000Z',
    location: 'Istanbul Campus / Room 3A',
    courseSlug: 'demo-data-platform-fundamentals',
  },
  {
    slug: 'demo-data-platform-architecture-lab',
    title: 'Demo: Data Platform Architecture Lab',
    summary: 'A focused working session on platform boundaries and ingestion design.',
    details: 'Teams sketch ingestion architecture and discuss ownership and handoff points.',
    startsAt: '2026-04-22T09:00:00.000Z',
    endsAt: '2026-04-22T12:30:00.000Z',
    location: 'Istanbul Campus / Lab 2',
    courseSlug: 'demo-data-platform-fundamentals',
  },
  {
    slug: 'demo-ai-product-kickoff',
    title: 'Demo: AI Product Kickoff',
    summary: 'Launch session for product managers and builders exploring practical AI delivery.',
    details: 'Covers goals, use-case framing, evaluation, and responsible delivery basics.',
    startsAt: '2026-05-05T10:00:00.000Z',
    endsAt: '2026-05-05T13:00:00.000Z',
    location: 'Online Live Session',
    courseSlug: 'demo-applied-ai-for-product-teams',
  },
  {
    slug: 'demo-ai-evaluation-clinic',
    title: 'Demo: AI Evaluation Clinic',
    summary: 'Workshop on testing AI behavior and improving output quality.',
    details: 'Attendees bring draft use cases and build a lightweight evaluation loop together.',
    startsAt: '2026-05-12T10:00:00.000Z',
    endsAt: '2026-05-12T12:00:00.000Z',
    location: 'Online Live Session',
    courseSlug: 'demo-applied-ai-for-product-teams',
  },
  {
    slug: 'demo-cloud-ops-incident-drill',
    title: 'Demo: Cloud Ops Incident Drill',
    summary: 'A live operational drill for incident response and communication.',
    details: 'Simulates a production event and exercises monitoring, ownership, and escalation flow.',
    startsAt: '2026-03-11T09:00:00.000Z',
    endsAt: '2026-03-11T12:00:00.000Z',
    location: 'Ankara Office / Operations Room',
    courseSlug: 'demo-cloud-operations-bootcamp',
  },
  {
    slug: 'demo-cloud-ops-observability-lab',
    title: 'Demo: Cloud Ops Observability Lab',
    summary: 'A workshop on metrics, alerts, and actionable operational visibility.',
    details: 'Participants review common alerting mistakes and tune an example monitoring setup.',
    startsAt: '2026-05-21T09:00:00.000Z',
    endsAt: '2026-05-21T12:00:00.000Z',
    location: 'Ankara Office / Lab 1',
    courseSlug: 'demo-cloud-operations-bootcamp',
  },
  {
    slug: 'demo-reliability-roundtable',
    title: 'Demo: Reliability Roundtable',
    summary: 'Discussion-oriented event for reliability strategy and executive alignment.',
    details: 'Brings together technical leaders to align on reliability tradeoffs and operating rhythm.',
    startsAt: '2026-04-29T13:00:00.000Z',
    endsAt: '2026-04-29T15:00:00.000Z',
    location: 'Executive Briefing Room',
    courseSlug: 'demo-platform-reliability-workshop',
  },
  {
    slug: 'demo-frontend-systems-sprint-review',
    title: 'Demo: Frontend Systems Sprint Review',
    summary: 'Review session for component systems and shared UI delivery.',
    details: 'Teams review patterns, accessibility decisions, and rollout considerations.',
    startsAt: '2026-04-18T11:00:00.000Z',
    endsAt: '2026-04-18T13:30:00.000Z',
    location: 'Istanbul Campus / Studio',
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
          endsAt: event.endsAt,
          location: event.location,
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
