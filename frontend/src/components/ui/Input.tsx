import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputStyles =
  "w-full rounded-[var(--radius-md)] border border-[rgb(99_102_241/0.15)] bg-[rgb(15_23_42/0.45)] px-4 py-3 text-sm text-slate-100 outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-slate-500 focus:border-[rgb(99_102_241/0.35)] focus:bg-[rgb(15_23_42/0.65)] focus:shadow-[0_0_0_3px_rgb(99_102_241/0.08)] disabled:opacity-40";

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${inputStyles} ${className}`} {...props} />;
}

export function TextArea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`resize-none ${inputStyles} ${className}`}
      {...props}
    />
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-slate-400"
    >
      {children}
    </label>
  );
}
