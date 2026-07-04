"use client";

type ChroniAvatarProps = {
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
};

const sizes = {
  sm: "h-9 w-9",
  md: "h-14 w-14",
  lg: "h-[72px] w-[72px]",
};

export default function ChroniAvatar({
  size = "md",
  interactive = true,
}: ChroniAvatarProps) {
  return (
    <div
      className={`relative shrink-0 ${sizes[size]} ${
        interactive
          ? "chroni-float transition-transform duration-500 hover:scale-[1.04]"
          : ""
      }`}
      aria-hidden
    >
      {/* Soft ambient glow */}
      <div
        className={`${sizes[size]} chroni-glow absolute inset-0 rounded-[24%] bg-[#6366F1] opacity-40 blur-md`}
      />
      {/* Body */}
      <div
        className={`${sizes[size]} chroni-breathe absolute inset-0 rounded-[24%] bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#4338CA] shadow-[0_4px_20px_rgb(99_102_241/0.3)]`}
      />
      {/* Eyes */}
      <div className="absolute inset-0 flex items-center justify-center gap-[18%] pt-[8%]">
        <span className="chroni-eye h-[10%] w-[10%] rounded-full bg-white/95 shadow-[0_0_4px_rgb(255_255_255/0.3)]" />
        <span className="chroni-eye h-[10%] w-[10%] rounded-full bg-white/95 shadow-[0_0_4px_rgb(255_255_255/0.3)]" />
      </div>
      {/* Smile */}
      <div className="absolute bottom-[22%] left-1/2 h-[5%] w-[18%] -translate-x-1/2 rounded-full bg-white/25" />
    </div>
  );
}
