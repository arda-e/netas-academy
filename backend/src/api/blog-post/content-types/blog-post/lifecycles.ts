import revalidateTag from "../../../../utils/revalidate-frontend";

export default {
  afterCreate() {
    revalidateTag("api::blog-post.blog-post");
  },
  afterUpdate() {
    revalidateTag("api::blog-post.blog-post");
  },
  afterDelete() {
    revalidateTag("api::blog-post.blog-post");
  },
};
