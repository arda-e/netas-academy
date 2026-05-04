import revalidateTag from "../../../../../utils/revalidate-frontend";

export default {
  afterCreate() {
    revalidateTag("api::blog-author.blog-author");
  },
  afterUpdate() {
    revalidateTag("api::blog-author.blog-author");
  },
  afterDelete() {
    revalidateTag("api::blog-author.blog-author");
  },
};
