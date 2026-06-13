// Browser-only image downscaler. Vercel Functions reject request bodies over
// 4.5 MB, and a Server Action IS a Vercel Function — so a raw phone photo
// (3-8 MB) makes the publish/upload POST 413 before our action runs. We shrink
// the image to <=1920px webp in the browser first (typically 200-500 KB), which
// also strips EXIF (canvas re-encode drops it). The server still re-processes
// with sharp as a safety net. Falls back to the original file if the browser
// can't decode it, so exotic formats still reach the server's own validation.

const MAX_EDGE = 1920;
const QUALITY = 0.82;

export async function downscaleImage(file: File): Promise<File> {
  if (typeof document === "undefined") return file; // SSR guard; never hit in handlers
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", QUALITY)
    );
    if (!blob) return file;
    // If re-encoding somehow grew the file (tiny already-optimised images), keep
    // the original — but only when it's safely under the platform limit.
    if (blob.size >= file.size && file.size < 4 * 1024 * 1024) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file; // unsupported format -> let the server validate/reject it
  }
}
