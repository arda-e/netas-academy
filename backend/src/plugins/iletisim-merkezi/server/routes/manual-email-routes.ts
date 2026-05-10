export default {
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/events/:documentId/send-manual-email',
      handler: 'manualEmailController.send',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/events/:documentId/send-test-email',
      handler: 'manualEmailController.sendTest',
      config: {
        policies: [],
      },
    },
  ],
};
