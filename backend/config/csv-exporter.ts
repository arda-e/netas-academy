const config = () => ({
  config: {
    'api::course.course': {
      dropdownLabel: 'Kurslar',
      columns: ['title', 'slug', 'summary', 'description'],
    },
    'api::event.event': {
      dropdownLabel: 'Etkinlikler',
      columns: ['title', 'slug', 'summary', 'startsAt', 'endsAt', 'location', 'details'],
    },
    'api::blog-post.blog-post': {
      dropdownLabel: 'Blog Yazıları',
      columns: ['title', 'slug', 'excerpt', 'content'],
    },
    'api::teacher.teacher': {
      dropdownLabel: 'Eğitmenler',
      columns: ['fullName', 'slug', 'headline', 'bio', 'email'],
    },
  },
  dateFormat: 'dd.MM.yyyy HH:mm',
  timeZone: 'Europe/Istanbul',
  ignore: ['createdAt', 'updatedAt', 'publishedAt', 'createdBy', 'updatedBy', 'locale'],
});

export default config;
