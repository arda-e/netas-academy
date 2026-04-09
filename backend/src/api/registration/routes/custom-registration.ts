export default {
  routes: [
    {
      method: 'POST',
      path: '/registrations/register',
      handler: 'registration.register',
      config: {
        auth: false,
      },
    },
  ],
};
