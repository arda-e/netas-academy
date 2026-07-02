export default {
  routes: [
    {
      method: "POST",
      path: "/payments/:attemptReference/retry",
      handler: "payment-orchestration.retry",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/payments/iyzico/callback",
      handler: "payment-orchestration.iyzicoCallback",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/payments/iyzico/webhook",
      handler: "payment-orchestration.iyzicoWebhook",
      config: {
        auth: false,
      },
    },
  ],
};
