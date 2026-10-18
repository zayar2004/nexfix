import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeSearchClient } from "@/components/home/HomeSearchClient";
import { db } from "@/db";
import { homepageConfig } from "@/db/schema";
import { eq, and } from "drizzle-orm";


export default async function HomePage() {
  // Fetch published Home Config from DB (fallback to defaults if not found)
  const [config] = await db
    .select()
    .from(homepageConfig)
    .where(and(eq(homepageConfig.locale, "en"), eq(homepageConfig.isPublished, "published")))
    .limit(1);

  const heroData = config ? {
    heading: config.heroHeading,
    description: config.heroDescription,
    imageUrl: config.heroImageUrl,
  } : null;

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      
      <main className="max-w-3xl mx-auto">
        {/* Pass DB data to HeroSection (with fallback) */}
        <HeroSection data={heroData} />

        <div className="px-4 py-5">
          <HomeSearchClient locale="en" />
          
          {/* Recent Diagnostics (UI only for now) */}
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="nx-section-heading text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Recent Diagnostics
              </h2>
              <button className="text-sm text-[var(--nx-accent)] font-medium">View All</button>
            </div>
            <div className="text-center py-6 text-[var(--nx-text-muted-updated)] text-sm bg-[var(--nx-bg-card)] rounded-xl border border-dashed border-[var(--nx-border-updated)]">
              No recent diagnostics yet.
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
