"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { restoreSlotPhoto, uploadSlotPhoto } from "./actions";
import { IDLE_STATE } from "./shared";
import { downscaleImage } from "./downscale";

const MAX_BYTES = 10 * 1024 * 1024;

function UploadButton({ disabled, busyLabel }: { disabled?: boolean; busyLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="rounded bg-astra-red px-3 py-1.5 text-xs font-black uppercase tracking-wide text-white disabled:opacity-60"
    >
      {pending ? "Uploading…" : busyLabel ?? "Upload replacement"}
    </button>
  );
}

export function PhotoSlotCard({
  slot,
  currentUrl,
  isOverride
}: {
  slot: { key: string; label: string };
  currentUrl: string;
  isOverride: boolean;
}) {
  const [state, formAction] = useFormState(uploadSlotPhoto, IDLE_STATE);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [fileError, setFileError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setFileError(null);
      router.refresh();
    }
  }, [state, router]);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    setFileError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Please choose an image file.");
      input.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError("Image is larger than 10 MB.");
      input.value = "";
      return;
    }
    // Shrink in the browser so the submit body stays under Vercel's 4.5 MB cap.
    setCompressing(true);
    try {
      const optimized = await downscaleImage(file);
      const dt = new DataTransfer();
      dt.items.add(optimized);
      input.files = dt.files;
    } catch {
      // keep the original file; the server will validate/reject it
    } finally {
      setCompressing(false);
    }
  }

  const errorMsg = state ? state.error : "Something interrupted the upload — please try a smaller image.";

  return (
    <div className="card-dark p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-white">{slot.label}</p>
        {isOverride ? (
          <span className="shrink-0 rounded-full bg-astra-gold/15 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wide text-astra-gold">
            Override active
          </span>
        ) : null}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={currentUrl} alt="" className="mt-3 h-40 w-full rounded object-cover" />
      <form ref={formRef} action={formAction} className="mt-3 grid gap-2">
        <input type="hidden" name="slot" value={slot.key} />
        <input
          type="file"
          name="image"
          accept="image/*"
          required
          onChange={onFileChange}
          className="text-xs text-white/80 file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-white"
        />
        {fileError ? <p className="text-xs font-semibold text-astra-red">{fileError}</p> : null}
        {errorMsg ? <p className="text-xs font-semibold text-astra-red">{errorMsg}</p> : null}
        <UploadButton disabled={compressing} busyLabel={compressing ? "Optimising…" : undefined} />
      </form>
      {isOverride ? (
        <form action={restoreSlotPhoto} className="mt-2">
          <input type="hidden" name="slot" value={slot.key} />
          <button
            type="submit"
            className="text-xs font-bold text-white/60 underline-offset-2 transition hover:text-white hover:underline"
          >
            Restore default
          </button>
        </form>
      ) : null}
    </div>
  );
}
