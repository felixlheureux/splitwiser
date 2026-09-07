import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";

interface Scenario {
  name: string;
  description: string;
  rawTransfers: { from: string; to: string; amount: number; reason: string }[];
  simplified: { from: string; to: string; amount: number }[];
}

const scenarios: Scenario[] = [
  {
    name: "Weekend Dinner & Drinks",
    description: "3 friends out for dinner, cocktails, and an Uber ride home.",
    rawTransfers: [
      { from: "Bob", to: "Alice", amount: 40, reason: "Dinner tab ($120 split 3 ways)" },
      { from: "Charlie", to: "Alice", amount: 40, reason: "Dinner tab ($120 split 3 ways)" },
      { from: "Alice", to: "Bob", amount: 15, reason: "Drinks ($30 split 2 ways)" },
      { from: "Charlie", to: "Bob", amount: 15, reason: "Uber ride ($30 split 2 ways)" },
    ],
    simplified: [
      { from: "Charlie", to: "Alice", amount: 25 },
      { from: "Bob", to: "Alice", amount: 25 },
      { from: "Charlie", to: "Bob", amount: 15 },
    ],
  },
  {
    name: "Cottage Trip Getaway",
    description: "Groceries, gas, and supplies paid by different group members.",
    rawTransfers: [
      { from: "Bob", to: "Alice", amount: 50, reason: "Groceries & BBQ supplies" },
      { from: "Charlie", to: "Alice", amount: 50, reason: "Groceries & BBQ supplies" },
      { from: "Alice", to: "Charlie", amount: 30, reason: "Highway gas & park passes" },
      { from: "Bob", to: "Charlie", amount: 30, reason: "Highway gas & park passes" },
    ],
    simplified: [
      { from: "Bob", to: "Alice", amount: 20 },
      { from: "Bob", to: "Charlie", amount: 30 },
      { from: "Charlie", to: "Alice", amount: 20 },
    ],
  },
];

export function DebtDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const current = scenarios[scenarioIndex];

  return (
    <section id="demo" className="py-20 bg-slate-50/70 border-b border-slate-200/60 scroll-mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 font-semibold px-3 py-1">
            <Sparkles className="size-3.5 mr-1 inline text-teal-600" />
            Algorithm In Action
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Debt Simplification Works
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Instead of everyone sending money back and forth across 4 different apps, Splitwiser calculates the optimal minimum path so everyone settles in one tap.
          </p>
        </div>

        {/* Interactive Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
          {/* Header & Scenario Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Scenario {scenarioIndex + 1} of {scenarios.length}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {current.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{current.description}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setScenarioIndex((scenarioIndex + 1) % scenarios.length)}
              className="self-start sm:self-auto text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              <span>Switch Scenario</span>
            </Button>
          </div>

          {/* Side by side comparison: Raw vs Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Raw Messy IOUs */}
            <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  Without Simplification (Messy)
                </span>
                <Badge variant="destructive" className="text-[10px] bg-rose-100 text-rose-700 border-none">
                  {current.rawTransfers.length} Transfers
                </Badge>
              </div>

              <div className="space-y-2 pt-1">
                {current.rawTransfers.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-rose-100 text-xs shadow-2xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {t.from} <span className="text-slate-400 font-normal">owes</span> {t.to}
                      </p>
                      <p className="text-[11px] text-slate-500">{t.reason}</p>
                    </div>
                    <span className="font-bold text-rose-600">${t.amount}.00</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Splitwiser Simplified */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  With Splitwiser (Optimized)
                </span>
                <Badge variant="accent" className="text-[10px] bg-teal-100 text-teal-800 border-none">
                  ⚡️ Minimum Transfers
                </Badge>
              </div>

              <div className="space-y-2 pt-1">
                {current.simplified.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-white border border-teal-200 text-sm shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </div>
                      <p className="font-semibold text-slate-900">
                        {t.from}{" "}
                        <span className="text-slate-400 font-normal">pays</span>{" "}
                        <strong>{t.to}</strong>
                      </p>
                    </div>
                    <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      ${t.amount}.00
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-white/80 border border-teal-100 text-[11px] text-teal-900 flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-teal-600 shrink-0" />
                <span>Zero circular debt. Everyone is settled up in the fewest possible steps.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
