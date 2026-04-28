export default {
  routes: [
    {
      method: 'POST',
      path: '/analytics-events/capture',
      handler: 'analytics-event.capture',
      config: {
        auth: false,
      },
    },
  ],
};
