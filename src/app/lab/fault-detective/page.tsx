"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/layout/TopNav";
import { BottomNav } from "@/components/layout/BottomNav";
import { useSettings } from "@/lib/settings-context";
import { LAB_SCENARIOS } from "@/lib/lab-scenarios";
import { ArrowLeft, Search, CheckCircle, XCircle, AlertTriangle, ChevronRight } from "lucide-react";

export default function FaultDetectivePage() {
  const { t, locale } = useSettings();
  const router = useRouter();
  const isMyanmar = locale === "my";

  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const scenario = activeScenario ? LAB_SCENARIOS.find((s) => s.id === activeScenario) : null;
  const step = scenario ? scenario.steps[currentStep] : null;

  const handleAnswer = (choiceId: string) => {
    if (!scenario || !step) return;
    setAnswers({ ...answers, [step.id]: choiceId });
  };

  const handleNext = () => {
    if (!scenario) return;
    if (currentStep < scenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Score
      const total = scenario.steps.length;
      const correct = scenario.steps.filter((s) => {
        const answerId = answers[s.id];
        return s.choices.find((c) => c.id === answerId)?.isCorrect;
      }).length;
      
      alert(isMyanmar 
        ? `ရမှတ်: ${correct}/${total}` 
        : `Score: ${correct}/${total}`);
      
      setActiveScenario(null);
      setCurrentStep(0);
      setAnswers({});
    }
  };

  if (activeScenario && scenario && step) {
    const selectedAnswer = answers[step.id];
    const selectedChoice = step.choices.find((c) => c.id === selectedAnswer);
    const isCorrect = selectedChoice?.isCorrect;

    return (
      <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
        <TopNav />
        <main className="max-w-3xl mx-auto p-4 py-4">
          <button onClick={() => { setActiveScenario(null); setCurrentStep(0); setAnswers({}); }} className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] mb-4">
            <ArrowLeft size={16} /> {isMyanmar ? "နောက်သို့" : "Back"}
          </button>

          <div className="mb-4">
            <span className="text-[10px] font-bold text-[var(--nx-cyan)] bg-[var(--nx-cyan)]/10 px-2 py-1 rounded border border-[var(--nx-cyan)]/30">
              {scenario.id}
            </span>
            <h1 className="text-xl font-bold text-white mt-2">
              {isMyanmar ? scenario.titleMy : scenario.titleEn}
            </h1>
            <p className="text-sm text-[var(--nx-text-muted-updated)] mt-1">
              {isMyanmar ? scenario.symptomMy : scenario.symptomEn}
            </p>
          </div>

          {/* Safety Note */}
          <div className="p-3 bg-[var(--nx-warning)]/10 border border-[var(--nx-warning)]/30 rounded-lg mb-4 flex gap-2">
            <AlertTriangle size={16} className="text-[var(--nx-warning)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--nx-warning)]">
              {isMyanmar ? scenario.safetyNoteMy : scenario.safetyNoteEn}
            </p>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-[var(--nx-text-muted-updated)] mb-1">
              <span>{isMyanmar ? "အဆင့်" : "Step"} {currentStep + 1} / {scenario.steps.length}</span>
            </div>
            <div className="h-1.5 bg-[var(--nx-bg-card)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--nx-cyan)] transition-all" style={{ width: `${((currentStep + 1) / scenario.steps.length) * 100}%` }} />
            </div>
          </div>

          {/* Question */}
          <div className="bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl p-4 mb-4">
            <p className="font-bold text-white mb-3">
              {isMyanmar ? step.questionMy : step.questionEn}
            </p>
            <div className="flex flex-col gap-2">
              {step.choices.map((choice) => {
                const isSelected = selectedAnswer === choice.id;
                const showResult = selectedAnswer !== undefined;
                
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswer(choice.id)}
                    disabled={showResult}
                    className={`p-3 rounded-lg text-left text-sm transition border ${
                      !showResult
                        ? "bg-[var(--nx-bg-base-deep)] border-[var(--nx-border-updated)] text-white hover:border-[var(--nx-cyan)]"
                        : isSelected && choice.isCorrect
                          ? "bg-green-500/10 border-green-500/50 text-green-300"
                          : isSelected && !choice.isCorrect
                            ? "bg-red-500/10 border-red-500/50 text-red-300"
                            : choice.isCorrect
                              ? "bg-green-500/5 border-green-500/30 text-green-400"
                              : "bg-[var(--nx-bg-base-deep)] border-[var(--nx-border-updated)] text-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {showResult && (
                        choice.isCorrect ? <CheckCircle size={16} className="text-green-400" /> : 
                        isSelected ? <XCircle size={16} className="text-red-400" /> : null
                      )}
                      <span>{isMyanmar ? choice.textMy : choice.textEn}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          {selectedAnswer && (
            <div className={`p-4 rounded-xl mb-4 border ${isCorrect ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <p className={`text-sm font-bold mb-1 ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                {isCorrect ? (isMyanmar ? "✅ မှန်ကန်သည်!" : "✅ Correct!") : (isMyanmar ? "❌ မှားသည်" : "❌ Incorrect")}
              </p>
              <p className="text-xs text-[var(--nx-text-secondary-updated)]">
                {isMyanmar ? step.explanationMy : step.explanationEn}
              </p>
            </div>
          )}

          {selectedAnswer && (
            <button onClick={handleNext} className="w-full py-3 bg-[var(--nx-cyan)] text-black font-bold rounded-lg">
              {currentStep < scenario.steps.length - 1 
                ? (isMyanmar ? "နောက်အဆင့် →" : "Next Step →") 
                : (isMyanmar ? "ပြီးဆုံး" : "Finish")}
            </button>
          )}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--nx-bg-base-deep)] nx-pb-bottom-nav">
      <TopNav />
      <main className="max-w-3xl mx-auto p-4 py-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[var(--nx-text-muted-updated)] mb-4">
          <ArrowLeft size={16} /> {isMyanmar ? "နောက်သို့" : "Back"}
        </button>

        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Search className="text-[var(--nx-error)]" size={28} /> 
          {isMyanmar ? "ချို့ယွင်းချက် ရှာဖွေသူ" : "Fault Detective"}
        </h1>
        <p className="text-sm text-[var(--nx-text-muted-updated)] mb-6">
          {isMyanmar ? "လက်တွေ့ ပြဿနာများကို ဖြေရှင်းလေ့ကျင့်ပါ" : "Practice troubleshooting realistic scenarios"}
        </p>

        <div className="flex flex-col gap-3">
          {LAB_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveScenario(s.id)}
              className="flex items-center gap-3 p-4 bg-[var(--nx-bg-card)] border border-[var(--nx-border-updated)] rounded-xl hover:border-[var(--nx-cyan)] transition text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--nx-error)]/10 flex items-center justify-center flex-shrink-0">
                <Search size={20} className="text-[var(--nx-error)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-[var(--nx-cyan)] bg-[var(--nx-cyan)]/10 px-1.5 py-0.5 rounded">{s.id}</span>
                </div>
                <p className="font-bold text-white text-sm truncate">{isMyanmar ? s.titleMy : s.titleEn}</p>
                <p className="text-xs text-[var(--nx-text-muted-updated)] truncate">{isMyanmar ? s.symptomMy : s.symptomEn}</p>
              </div>
              <ChevronRight size={18} className="text-[var(--nx-text-muted-updated)] group-hover:text-[var(--nx-cyan)] flex-shrink-0" />
            </button>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
