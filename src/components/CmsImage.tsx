import type { Image } from "../cms/schema";
import clsx from "clsx";
import { default as NextImage } from "next/image";

interface Props {
  image?: Image;
  alt?: string;
  className?: string;
}

export default function CMSImage({ image, alt, className }: Props) {
  if (!image) {
    return <div className={className} />;
  }
  const svg = image.type === "image/svg+xml";
  const url = `${process.env.NEXT_PUBLIC_CMS_URL}/assets/${image.id}/${image.filename_download}`;
  const placeholder = image.blurDataURL ? "blur" : "empty";

  return (
    <NextImage
      unoptimized={svg}
      src={url}
      width={image.width ?? (svg ? 0 : undefined)}
      height={image.height ?? (svg ? 0 : undefined)}
      alt={alt || image.description || image.title || ""}
      sizes="100vw"
      blurDataURL={image.blurDataURL}
      placeholder={placeholder}
      className={clsx(className)}
    />
  );
}
