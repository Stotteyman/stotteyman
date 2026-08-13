/**
 * The cover image for a project card.
 *
 * `projects.image_url` exists in the schema but is null for every row today, and an
 * editorial layout collapses into a wall of grey boxes without something in the frame.
 * So this renders a deterministic generated cover from the slug — same project, same
 * artwork, every render and on both server and client, which a random seed could not
 * promise without a hydration mismatch.
 *
 * It is a placeholder with a defined exit: the moment `image_url` is set from HQ, the
 * real screenshot takes over and nothing else about the layout changes.
 */

type Props = {
  slug: string;
  title: string;
  imageUrl?: string | null;
  className?: string;
  /** Editorial covers get more room to breathe than grid cards. */
  density?: 'card' | 'feature';
};

/** FNV-1a. Small, stable, and dependency-free — the values just need to be spread out. */
function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export default function ProjectVisual({
  slug,
  title,
  imageUrl,
  className = '',
  density = 'card',
}: Props) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- covers are remote and
      // arbitrary; next/image would need every future host allow-listed in config.
      <img
        src={imageUrl}
        alt=""
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const h = hash(slug);
  // Rotate around the accent rather than the full colour wheel: the brand rule is one
  // accent, so covers stay in a warm band instead of turning the grid into a rainbow.
  const hue = 18 + (h % 46);
  const angle = 120 + ((h >> 8) % 110);
  const cx = 20 + ((h >> 5) % 60);
  const cy = 18 + ((h >> 11) % 55);
  const rings = 3 + ((h >> 17) % 3);
  const cells = density === 'feature' ? 13 : 9;
  const initials = title
    .split(/[\s.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      aria-hidden
      className={`relative h-full w-full overflow-hidden bg-bg-raised ${className}`}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, hsl(${hue} 92% 54% / 0.30) 0%, hsl(${hue - 14} 80% 40% / 0.10) 42%, transparent 74%)`,
      }}
    >
      {/* Hairline grid — the same motif as the homepage ground, so covers read as part
          of the page rather than as pasted-in artwork. */}
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.5) 1px, transparent 1px)',
          backgroundSize: `${100 / cells}% ${100 / cells}%`,
        }}
      />

      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {Array.from({ length: rings }, (_, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={16 + i * (11 + (h % 7))}
            fill="none"
            stroke={`hsl(${hue} 95% 60%)`}
            strokeWidth={0.35}
            opacity={0.5 - i * 0.11}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <span
        className={`absolute bottom-3 right-4 font-mono font-medium tracking-tight text-white/[0.07] ${
          density === 'feature' ? 'text-[7rem] leading-none' : 'text-6xl leading-none'
        }`}
      >
        {initials}
      </span>
    </div>
  );
}
