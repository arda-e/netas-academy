export default {
  routes: [
    {
      method: 'GET',
      path: '/events/:documentId/registration-status',
      handler: 'event.registrationStatus',
      config: { auth: false },
    },
  ],
};
