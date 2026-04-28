export default {
  routes: [
    {
      method: "POST",
      path: "/course-applications/submit",
      handler: "course-application.submit",
      config: {
        auth: false,
      },
    },
  ],
};

