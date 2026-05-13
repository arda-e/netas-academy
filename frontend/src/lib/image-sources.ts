import type { StaticImageData } from "next/image";

export type ImageSource = string | StaticImageData;

export function getImagePlaceholderProps(
  src: ImageSource | null | undefined,
  blurDataURL?: string | null,
) {
  if (blurDataURL) {
    return { placeholder: "blur" as const, blurDataURL };
  }

  if (typeof src === "object" && src?.blurDataURL) {
    return { placeholder: "blur" as const };
  }

  return {};
}
