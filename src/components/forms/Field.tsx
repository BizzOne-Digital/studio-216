import { cn } from "@/lib/utils";

export function Field({ label, error, children, className, required, htmlFor }: { label: string; error?: string; children: React.ReactNode; className?: string; required?: boolean; htmlFor?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required && <span className="ml-0.5 text-white" aria-hidden>*</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ busy, children, className }: { busy?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={cn(
        "inline-flex h-[52px] items-center justify-center gap-2 rounded-lg bg-[linear-gradient(180deg,#fff,#dcdcdc)] px-8 text-[15px] font-bold text-ink shadow-[inset_0_1px_0_#fff] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60",
        className
      )}
    >
      {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" aria-hidden />}
      {children}
    </button>
  );
}
