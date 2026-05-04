import revalidateTag from "../../../../../utils/revalidate-frontend";

export default {
  afterCreate() {
    revalidateTag("api::course.course");
  },
  afterUpdate() {
    revalidateTag("api::course.course");
  },
  afterDelete() {
    revalidateTag("api::course.course");
  },
};
