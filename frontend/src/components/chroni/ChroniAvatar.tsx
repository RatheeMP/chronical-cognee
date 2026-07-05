"use client";

type ChroniAvatarProps = {
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
};

const sizes = {
  sm: {
    box: "h-11 w-11",
    halo: "-inset-[22%]",
    ring: "-inset-[10%]",
    eye: "h-[9%] w-[9%]",
    gap: "gap-[16%]",
    pt: "pt-[7%]",
    smile: "bottom-[24%] w-[16%] h-[4%]",
  },
  md: {
    box: "h-16 w-16",
    halo: "-inset-[24%]",
    ring: "-inset-[12%]",
    eye: "h-[9%] w-[9%]",
    gap: "gap-[17%]",
    pt: "pt-[8%]",
    smile: "bottom-[23%] w-[17%] h-[4%]",
  },
  lg: {
    box: "h-24 w-24",
    halo: "-inset-[26%]",
    ring: "-inset-[14%]",
    eye: "h-[8.5%] w-[8.5%]",
    gap: "gap-[18%]",
    pt: "pt-[8%]",
    smile: "bottom-[22%] w-[18%] h-[3.5%]",
  },
};

export default function ChroniAvatar({
  size = "md",
  interactive = true,
}: ChroniAvatarProps) {
  const s = sizes[size];

  return (
    <div
      className={`relative shrink-0 ${s.box} chroni-float ${
        interactive
          ? "cursor-default transition-transform duration-500 ease-out hover:scale-[1.05]"
          : ""
      }`}
      aria-hidden
    >
      {/* Indigo ambient halo */}
      <div
        className={`absolute ${s.halo} rounded-full bg-[#4338CA] opacity-35 blur-2xl chroni-halo`}
      />

      {/* Soft outer ring */}
      <div
        className={`absolute ${s.ring} rounded-[30%] border border-[rgb(99_102_241/0.35)] bg-[rgb(99_102_241/0.06)] chroni-glow backdrop-blur-[2px]`}
      />

      {/* Breathing body */}
      <div className={`absolute inset-0 chroni-breathe ${s.box}`}>
        {/* Glass shell */}
        <div
          className={`chroni-shell absolute inset-0 overflow-hidden rounded-[28%] backdrop-blur-sm`}
        >
          {/* Core gradient */}
          <div
            className={`absolute inset-[5%] rounded-[24%] bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#312E81]`}
          />

          {/* Specular highlight */}
          <div className="pointer-events-none absolute left-[10%] top-[8%] h-[38%] w-[48%] rounded-full bg-gradient-to-br from-white/30 to-transparent blur-[3px]" />

          {/* Inner depth */}
          <div className="pointer-events-none absolute inset-0 rounded-[28%] bg-gradient-to-b from-white/[0.07] via-transparent to-[rgb(15_13_35/0.25)]" />
        </div>

        {/* Face */}
        <div
          className={`absolute inset-0 flex items-center justify-center ${s.gap} ${s.pt}`}
        >
          <span
            className={`chroni-eye ${s.eye} rounded-full bg-white/95 shadow-[0_0_6px_rgb(255_255_255/0.35)]`}
          />
          <span
            className={`chroni-eye ${s.eye} rounded-full bg-white/95 shadow-[0_0_6px_rgb(255_255_255/0.35)]`}
          />
        </div>

        {/* Subtle smile arc */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 rounded-full border-b border-white/30 ${s.smile}`}
        />
      </div>
    </div>
  );
}
