import Link from "next/link";
import { CalendarDays, Lock, Pencil, Plus, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { adminEventsStub } from "@/src/lib/site-data";
import { createSupabaseServerClient, hasSupabaseServerEnv } from "@/src/lib/supabase/server";

export const dynamic = "force-dynamic";

type AdminProfile = {
  role: "admin" | "member";
  full_name: string | null;
};

async function getAdminState() {
  const supabase = createSupabaseServerClient();

  if (!hasSupabaseServerEnv() || !supabase) {
    return {
      kind: "not-configured" as const
    };
  }

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      kind: "signed-out" as const
    };
  }

  const { data: profile, error: profileError } = (await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle()) as {
    data: AdminProfile | null;
    error: { message: string } | null;
  };

  if (profileError) {
    return {
      kind: "profile-pending" as const,
      email: user.email
    };
  }

  if (profile?.role !== "admin") {
    return {
      kind: "forbidden" as const,
      email: user.email
    };
  }

  return {
    kind: "admin" as const,
    email: user.email,
    name: profile.full_name
  };
}

export default async function AdminPage() {
  const state = await getAdminState();

  return (
    <main id="main-content" className="min-h-screen bg-astra-white pt-20">
      <section className="field-grid px-5 py-20 text-white">
        <div className="container-wide">
          <p className="mb-4 text-sm font-black uppercase tracking-normal text-astra-gold">Phase 2 scaffold</p>
          <h1 className="crest-type max-w-5xl text-5xl leading-[0.9] sm:text-7xl">Admin and events.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/76">
            Supabase auth, role-gating, and the events CRUD surface are prepared for the next build phase.
          </p>
        </div>
      </section>

      <section className="section-band bg-white">
        <div className="container-wide">
          {state.kind === "not-configured" ? <NotConfiguredState /> : null}
          {state.kind === "signed-out" ? <SignedOutState /> : null}
          {state.kind === "profile-pending" ? <ProfilePendingState email={state.email} /> : null}
          {state.kind === "forbidden" ? <ForbiddenState email={state.email} /> : null}
          {state.kind === "admin" ? <AdminDashboard email={state.email} name={state.name} /> : null}
        </div>
      </section>
    </main>
  );
}

function NotConfiguredState() {
  return (
    <div className="card-plain max-w-3xl p-8">
      <ShieldAlert aria-hidden="true" className="mb-5 h-8 w-8 text-astra-red" />
      <h2 className="text-2xl font-black text-astra-ink">Supabase is not configured yet.</h2>
      <p className="mt-4 text-base leading-7 text-slate-700">
        Add Supabase env vars in Vercel and `.env.local` to enable auth. The public site still builds and deploys without these values.
      </p>
      <code className="mt-5 block rounded bg-slate-100 p-4 text-sm text-slate-800">
        NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
      </code>
    </div>
  );
}

function SignedOutState() {
  return (
    <div className="card-plain max-w-3xl p-8">
      <Lock aria-hidden="true" className="mb-5 h-8 w-8 text-astra-red" />
      <h2 className="text-2xl font-black text-astra-ink">Admin access required.</h2>
      <p className="mt-4 text-base leading-7 text-slate-700">
        Sign in with a Supabase account that has the `admin` profile role to manage events.
      </p>
      <Link
        href="/admin/login"
        className="mt-6 inline-flex rounded bg-astra-red px-5 py-3 text-sm font-black uppercase tracking-normal text-white transition hover:bg-red-700"
      >
        Go to login
      </Link>
    </div>
  );
}

function ProfilePendingState({ email }: { email?: string }) {
  return (
    <div className="card-plain max-w-3xl p-8">
      <ShieldAlert aria-hidden="true" className="mb-5 h-8 w-8 text-astra-red" />
      <h2 className="text-2xl font-black text-astra-ink">Profile table is pending.</h2>
      <p className="mt-4 text-base leading-7 text-slate-700">
        Signed in as {email ?? "this user"}, but the `profiles` role lookup is not available yet. Run the Supabase schema before enabling admin access.
      </p>
    </div>
  );
}

function ForbiddenState({ email }: { email?: string }) {
  return (
    <div className="card-plain max-w-3xl p-8">
      <ShieldAlert aria-hidden="true" className="mb-5 h-8 w-8 text-astra-red" />
      <h2 className="text-2xl font-black text-astra-ink">This account is not an admin.</h2>
      <p className="mt-4 text-base leading-7 text-slate-700">
        {email ?? "This account"} is authenticated, but does not have the `admin` role required for event management.
      </p>
    </div>
  );
}

function AdminDashboard({ email, name }: { email?: string; name: string | null }) {
  return (
    <div className="grid gap-8">
      <div className="card-plain p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-emerald-700">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
              <span className="text-sm font-black uppercase tracking-normal">Admin verified</span>
            </div>
            <h2 className="text-3xl font-black text-astra-ink">Events CRUD scaffold</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Signed in as {name ?? email ?? "an admin"}. The next phase can wire these controls to Supabase mutations.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded bg-slate-300 px-5 py-3 text-sm font-black uppercase tracking-normal text-slate-700"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            New event
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {adminEventsStub.map((event) => (
          <article key={event.title} className="card-plain grid gap-5 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 flex items-center gap-3 text-sm font-black uppercase tracking-normal text-astra-red">
                <CalendarDays aria-hidden="true" className="h-5 w-5" />
                {event.date}
              </div>
              <h3 className="text-2xl font-black text-astra-ink">{event.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{event.location}</p>
              <p className="mt-3 text-xs font-black uppercase tracking-normal text-slate-500">
                {event.published ? "Published" : "Draft"}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled className="rounded border border-slate-300 p-3 text-slate-500">
                <Pencil aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Edit event</span>
              </button>
              <button type="button" disabled className="rounded border border-slate-300 p-3 text-slate-500">
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">Delete event</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
