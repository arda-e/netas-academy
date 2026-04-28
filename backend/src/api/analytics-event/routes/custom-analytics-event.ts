export default {
  routes: [
    {
      method: 'POST',
      path: '/analytics-events/capture',
      handler: 'analytics-event.capture',
      config: {
        // TODO(U14): Add rate limiting. This endpoint is public (auth: false)
        // and accepts arbitrary data, making it susceptible to abuse.
        auth: false,
      },
    },
  ],
};
