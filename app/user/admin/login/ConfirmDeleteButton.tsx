"use client";

import { deleteNotice } from "./actions";

export function ConfirmDeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteNotice}
      onSubmit={(e) => {
        if (!confirm("Delete this notice? This can't be undone.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded border border-astra-red/40 px-3 py-1.5 text-xs font-bold text-astra-red transition hover:border-astra-red hover:text-white"
      >
        Delete
      </button>
    </form>
  );
}
