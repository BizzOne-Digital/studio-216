"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/client";
import { contactSchema, type ContactInput } from "@/lib/validations";
import { Field, SubmitButton } from "./Field";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactInput) => {
    try {
      await api("/api/contact", { method: "POST", json: values });
      setSent(true);
      reset();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (sent) {
    return (
      <div className="metal-border rounded-2xl p-10 text-center" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12" strokeWidth={1.4} aria-hidden />
        <h2 className="display mt-4 text-4xl">Message Sent</h2>
        <p className="mt-3 text-white/75">Thanks for reaching out. We&apos;ll get back to you as soon as possible.</p>
        <button onClick={() => setSent(false)} className="mt-6 rounded-lg border border-white/30 px-5 py-3 text-sm font-bold hover:bg-white hover:text-ink">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="metal-border grid gap-5 rounded-2xl p-6 sm:grid-cols-2 sm:p-8">
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden {...register("website")} />
      <Field label="Full name" required error={errors.name?.message} htmlFor="c-name">
        <input id="c-name" className="field" autoComplete="name" {...register("name")} />
      </Field>
      <Field label="Email" required error={errors.email?.message} htmlFor="c-email">
        <input id="c-email" type="email" className="field" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Phone" error={errors.phone?.message} htmlFor="c-phone">
        <input id="c-phone" type="tel" className="field" autoComplete="tel" {...register("phone")} />
      </Field>
      <Field label="Subject" error={errors.subject?.message} htmlFor="c-subject">
        <input id="c-subject" className="field" {...register("subject")} />
      </Field>
      <Field label="Message" required error={errors.message?.message} className="sm:col-span-2" htmlFor="c-message">
        <textarea id="c-message" rows={6} className="field resize-y" {...register("message")} />
      </Field>
      <div className="sm:col-span-2">
        <SubmitButton busy={isSubmitting} className="w-full sm:w-auto">
          Send Message
        </SubmitButton>
      </div>
    </form>
  );
}
