export default {
  routes: [
    {
      method: 'POST',
      path: '/events/:documentId/send-registration-email',
      handler: 'event.sendRegistrationEmail',
    },
  ],
};
