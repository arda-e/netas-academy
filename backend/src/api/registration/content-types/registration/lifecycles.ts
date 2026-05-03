/**
 * Registration lifecycle hooks.
 *
 * beforeCreate acts as an extra guard against duplicate registrations
 * at the application layer, complementing the DB unique index and
 * transaction-level checks in the registration service.
 */
export default {
  async beforeCreate(lifecycleEvent: { params: { data: { student?: number; event?: number } } }) {
    const { student, event } = lifecycleEvent.params.data;

    if (!student || !event) {
      return;
    }

    const existing = await strapi.db.query('api::registration.registration').findOne({
      where: {
        student: { id: student },
        event: { id: event },
      },
      select: ['id'],
    });

    if (existing) {
      throw new Error('Duplicate registration detected in lifecycle hook');
    }
  },
};
