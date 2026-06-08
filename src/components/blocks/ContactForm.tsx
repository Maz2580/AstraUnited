"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { SectionHeader } from "@/src/components/SectionHeader";

type Props = { title: string; intro?: string; subjects?: string[]; submitLabel: string; mailto: string };

export function ContactForm({ title, intro, subjects, submitLabel, mailto }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(subjects?.[0] ?? "General enquiry");
  const [message, setMessage] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${mailto}?subject=${encodeURIComponent(`[Astra United] ${subject}`)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };

  const field =
    "w-full rounded border border-white/12 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-astra-gold";

  return (
    <div className="container-wide max-w-3xl">
      <SectionHeader eyebrow="Get in touch" title={title} copy={intro} inverse />
      <form onSubmit={onSubmit} className="card-dark mt-8 grid gap-4 p-6 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required aria-label="Your name" />
          <input className={field} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email address" />
        </div>
        {subjects && subjects.length > 1 ? (
          <select className={field} value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Subject">
            {subjects.map((s) => (
              <option key={s} value={s} className="bg-astra-ink">
                {s}
              </option>
            ))}
          </select>
        ) : null}
        <textarea className={`${field} min-h-[140px]`} placeholder="Your message" value={message} onChange={(e) => setMessage(e.target.value)} required aria-label="Your message" />
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded bg-astra-red px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:bg-red-700">
          {submitLabel}
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
        <p className="text-xs text-white/48">This opens your email app addressed to the club. We aim to respond within 48 business hours.</p>
      </form>
    </div>
  );
}
