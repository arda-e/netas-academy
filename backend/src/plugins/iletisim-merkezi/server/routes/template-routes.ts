export default {
  type: 'admin',
  routes: [
    {
      method: 'GET',
      path: '/confirmation-template',
      handler: 'templateController.getTemplate',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/confirmation-template',
      handler: 'templateController.updateTemplate',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/confirmation-template/reset',
      handler: 'templateController.resetTemplate',
      config: {
        policies: [],
      },
    },
  ],
};
