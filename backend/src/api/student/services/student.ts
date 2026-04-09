import { factories } from '@strapi/strapi';

type UpsertStudentInput = {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
};

const normalizeWhitespace = (value?: string | null) => value?.trim().replace(/\s+/g, ' ') || '';
const normalizeEmail = (value: string) => value.trim().toLowerCase();

export default factories.createCoreService('api::student.student' as any, () => ({
  async upsertByEmail(input: UpsertStudentInput) {
    const firstName = normalizeWhitespace(input.firstName);
    const lastName = normalizeWhitespace(input.lastName);
    const email = normalizeEmail(input.email);
    const phone = normalizeWhitespace(input.phone);
    const fullName = [firstName, lastName].filter(Boolean).join(' ');

    const existingStudent = await strapi.db.query('api::student.student').findOne({
      where: { email },
    });

    if (existingStudent) {
      return strapi.db.query('api::student.student').update({
        where: { id: existingStudent.id },
        data: {
          firstName,
          lastName: lastName || null,
          fullName,
          email,
          phone: phone || null,
        },
      });
    }

    return strapi.db.query('api::student.student').create({
      data: {
        firstName,
        lastName: lastName || null,
        fullName,
        email,
        phone: phone || null,
      },
    });
  },
}));
