import revalidateTag from "../../../../utils/revalidate-frontend";

export default {
  afterCreate() {
    revalidateTag("api::teacher.teacher");
  },
  afterUpdate() {
    revalidateTag("api::teacher.teacher");
  },
  afterDelete() {
    revalidateTag("api::teacher.teacher");
  },
};
