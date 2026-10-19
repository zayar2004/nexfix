"use client";

import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";

export default function HelpPage() {
  const router = useRouter();
  const { t, locale } = useSettings();

  const faqs = locale === "my" ? [
    { q: "Error ကုဒ် ဘယ်လို ရှာရမလဲ?", a: "Home စာမျက်နှာကို သွားပြီး စက်နာမည် သို့မဟုတ် Error ကုဒ်ကို ရိုက်ထည့်ပါ။ ရလဒ်များ ချက်ချင်း ပေါ်လာပါမည်။" },
    { q: "Excel ဖိုင် ဘယ်လို တင်ရမလဲ?", a: "Home စာမျက်နှာတွင် 'Search by Machine Code' Tab ကို ရွေးပြီး 'Upload Excel File' ကို နှိပ်ပါ။ သင့် Excel မှာ 'Machine Code' ကော်လံ ပါရပါမည်။" },
    { q: "အင်တာနက်မရှိလည်း သုံးလို့ရလား?", a: "ရပါတယ်! ဒေတာ Sync လုပ်ပြီး သို့မဟုတ် Excel ဖိုင် တင်ပြီးပါက အင်တာနက်မရှိလည်း ရှာဖွေနိုင်ပြီး အကြောင်းအရာများကို ကြည့်နိုင်ပါသည်။" },
    { q: "ဘာသာစကား သို့မဟုတ် အပြင်အဆင် ဘယ်လို ပြောင်းရမလဲ?", a: "Profile → Language သို့မဟုတ် Settings → Theme ကို သွားပါ။ မြန်မာ/English နှင့် Dark/Light Mode တို့ကို ပြောင်းနိုင်ပါသည်။" },
    { q: "ဓာတ်ပုံ မပေါ်တာ ဘာကြောင့်လဲ?", a: "ပုံအရွယ်အစားကို 2MB အောက် ဖြစ်ပါစေ။ JPG သို့မဟုတ် PNG ပုံစံ အသုံးပြုကြည့်ပါ။" },
    { q: "ပြဿနာတစ်ခု ဘယ်လို အကြောင်းကြားရမလဲ?", a: "သင့် NEXFIX အုပ်ချုပ်သူကို ဆက်သွယ်ပါ သို့မဟုတ် support@nexfix.app သို့ အီးမေးလ် ပို့ပါ။" },
  ] : [
    { q: "How do I search for an error code?", a: "Go to the Home page and enter the machine name or error code in the search fields. Results will appear as you type." },
    { q: "How do I upload my Excel file?", a: "On the Home page, switch to 'Search by Machine Code' tab and click 'Upload Excel File'. Make sure your Excel has a 'Machine Code' column." },
    { q: "Can I use this app offline?", a: "Yes! Once you've synced data or uploaded an Excel file, you can search and view content even without internet." },
    { q: "How do I change language or theme?", a: "Go to Profile → Language or Settings → Theme. You can switch between Myanmar/English and Dark/Light mode." },
    { q: "Why isn't my photo showing?", a: "Make sure the image is under 2MB. Try a different image format (JPG or PNG)." },
    { q: "How do I report a problem?", a: "Contact your NEXFIX administrator or email support@nexfix.app with details of the issue." },
  ];

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 -ml-2 text-[var(--nx-text-primary)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-xl font-bold text-[var(--nx-text-primary)]">{t("helpSupport")}</h1>
        </div>

        <div className="p-5 bg-gradient-to-br from-[var(--nx-accent)]/10 to-[var(--nx-bg-card)] border border-[var(--nx-accent)]/20 rounded-xl mb-6">
          <h2 className="text-lg font-bold text-[var(--nx-text-primary)] mb-1">{t("needHelp")} 👋</h2>
          <p className="text-sm text-[var(--nx-text-secondary-updated)]">{t("needHelpDesc")}</p>
        </div>

        <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase mb-3">{t("faq")}</h3>

        <div className="flex flex-col gap-3 mb-6">
          {faqs.map((faq, i) => (
            <details key={i} className="group p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl">
              <summary className="cursor-pointer flex items-center justify-between list-none">
                <span className="font-semibold text-sm text-[var(--nx-text-primary)] pr-2">{faq.q}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--nx-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 transition-transform group-open:rotate-180"><polyline points="6 9 12 15 18 9"/></svg>
              </summary>
              <p className="text-sm text-[var(--nx-text-secondary-updated)] mt-3 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>

        <h3 className="text-sm font-bold text-[var(--nx-text-primary)] uppercase mb-3">{t("contactSupport")}</h3>

        <div className="flex flex-col gap-2">
          <a href="mailto:support@nexfix.app" className="p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl flex items-center gap-3 hover:border-[var(--nx-accent)] transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[var(--nx-accent)]/10 flex items-center justify-center text-[var(--nx-accent)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[var(--nx-text-primary)]">{t("emailSupport")}</p>
              <p className="text-xs text-[var(--nx-text-muted-updated)]">support@nexfix.app</p>
            </div>
          </a>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
