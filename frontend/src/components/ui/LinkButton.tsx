import Link from "next/link";

export default function LinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-gradient-to-r from-[#4338CA] via-[#6366F1] to-[#7C3AED] px-6 py-3 text-sm font-medium text-white shadow-[0_0_28px_rgb(99_102_241/0.3),0_1px_0_rgb(255_255_255/0.1)_inset] transition-all duration-300 hover:shadow-[0_0_40px_rgb(99_102_241/0.4),0_1px_0_rgb(255_255_255/0.15)_inset] hover:brightness-110 active:scale-[0.98]"
    >
      {children}
    </Link>
  );
}
