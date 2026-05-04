import revalidateTag from "../../../../../utils/revalidate-frontend";

export default {
  afterCreate() {
    revalidateTag("api::event.event");
  },
  afterUpdate() {
    revalidateTag("api::event.event");
  },
  afterDelete() {
    revalidateTag("api::event.event");
  },
};
