import Image from "next/image";

type HeroData = {
  heading: string;
  description: string;
  imageUrl: string;
} | null;

export function HeroSection({ data }: { data: HeroData }) {
  const heading = data?.heading || "Find Solutions\nKeep Machines Running";
  const description = data?.description || "Error codes, troubleshooting, and more for arcade technicians.";
  const imageUrl = data?.imageUrl || "/images/arcade-hero.jpg";

  // Split heading by newline to allow multi-line headings from DB
  const headingLines = heading.split("\n");

  return (
    <div className="relative w-full h-[320px] sm:h-[400px]">
      <div className="absolute inset-0 bg-[var(--nx-bg-surface-deep)]">
        <Image
          src={imageUrl}
          alt="Arcade machines"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-[var(--nx-hero-overlay)]"></div>
      </div>

      <div className="absolute bottom-0 left-0 p-5 pb-8 flex flex-col gap-2 w-full">
        <h1 className="nx-hero-heading">
          {headingLines.map((line, idx) => (
            <span key={idx}>
              {line}
              {idx < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h1>
        <p className="text-[var(--nx-text-secondary-updated)] text-sm max-w-[280px]">
          {description}
        </p>
      </div>
    </div>
  );
}
