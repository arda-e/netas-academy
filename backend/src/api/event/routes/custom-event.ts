export default {
  routes: [
    {
      method: 'POST',
      path: '/events/:documentId/send-registration-email',
      handler: 'event.sendRegistrationEmail',
    },
    {
      method: 'GET',
      path: '/events/:documentId/registration-status',
      handler: 'event.registrationStatus',
      config: { auth: false },
    },
  ],
};
