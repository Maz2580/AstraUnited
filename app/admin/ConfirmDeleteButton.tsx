"use client";

// Reused for notices and event posts: the caller passes the matching server
// action and a noun for the confirm prompt.
export function ConfirmDeleteButton({
  id,
  action,
  noun = "item"
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  noun?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(`Delete this ${noun}? This can't be undone.`)) e.preventDefault();
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
