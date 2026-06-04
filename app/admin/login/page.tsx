import type { Metadata } from "next";
import { AdminLoginForm } from "@/src/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Astra United FC admin authentication scaffold."
};

export default function AdminLoginPage() {
  return (
    <main id="main-content" className="min-h-screen bg-astra-white pt-20">
      <section className="field-grid px-5 py-20 text-white">
        <div className="container-wide max-w-4xl">
          <p className="mb-4 text-sm font-black uppercase tracking-normal text-astra-gold">Supabase Auth</p>
          <h1 className="crest-type text-5xl leading-[0.9] sm:text-7xl">Admin login.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/76">
            This scaffold supports magic-link or email/password authentication. Admin role checks happen on the protected admin route.
          </p>
        </div>
      </section>
      <section className="section-band bg-white">
        <AdminLoginForm />
      </section>
    </main>
  );
}
