import Image from "next/image";
import { getClubContent } from "@/src/lib/content/store";
import { resolvePhoto, type SlotKey } from "@/src/lib/content/photo-slots";

type Props = {
  slot: SlotKey;
  width: number;
  height: number;
  sizes: string;
  className?: string;
};

export async function SlotImage({ slot, width, height, sizes, className }: Props) {
  const { photoOverrides } = await getClubContent();
  const photo = resolvePhoto(slot, photoOverrides);
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      {...(photo.isOverride
        ? {} // uploads have no blurDataURL — render without placeholder
        : photo.blurDataURL
          ? { placeholder: "blur" as const, blurDataURL: photo.blurDataURL }
          : {})}
    />
  );
}
