import Image from "next/image";
import { translate } from "@/lib/i18n";

export function HeroSection({ locale }: { locale: "my" | "en" }) {
  const t = (key: string) => translate(locale, key);

  return (
    <div className="relative w-full h-[320px] sm:h-[400px]">
      {/* Background Image (Local) */}
      <div className="absolute inset-0 bg-[var(--nx-bg-surface-deep)]">
        <Image
          src="/images/arcade-hero.jpg"
          alt="Arcade machines"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-[var(--nx-hero-overlay)]"></div>
      </div>

      {/* Text Content */}
      <div className="absolute bottom-0 left-0 p-5 pb-8 flex flex-col gap-2 w-full">
        <h1 className="nx-hero-heading">
          {t("hero.heading.line1")} <br />
          {t("hero.heading.line2")}
        </h1>
        <p className="text-[var(--nx-text-secondary-updated)] text-sm max-w-[280px]">
          {t("hero.description")}
        </p>
      </div>
    </div>
  );
}
