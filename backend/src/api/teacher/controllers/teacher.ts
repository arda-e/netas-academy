import { factories } from '@strapi/strapi';

const defaultTeacherPopulate = {
  profilePhoto: {
    fields: ['url', 'alternativeText'],
  },
  courses: {
    fields: ['title', 'slug'],
  },
};

function mergePopulate(existingPopulate: unknown) {
  if (!existingPopulate || typeof existingPopulate !== 'object' || Array.isArray(existingPopulate)) {
    return defaultTeacherPopulate;
  }

  return {
    ...defaultTeacherPopulate,
    ...(existingPopulate as Record<string, unknown>),
  };
}

export default factories.createCoreController('api::teacher.teacher', () => ({
  async find(ctx) {
    ctx.query.populate = mergePopulate(ctx.query.populate);
    return super.find(ctx);
  },

  async findOne(ctx) {
    ctx.query.populate = mergePopulate(ctx.query.populate);
    return super.findOne(ctx);
  },
}));
