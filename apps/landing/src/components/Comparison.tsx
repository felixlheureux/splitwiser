import { Badge } from "@/components/ui/badge";
import { Check, X, ArrowLeftRight } from "lucide-react";

export function Comparison() {
  const rows = [
    {
      feature: "Daily Expense Limit",
      splitwiser: "Unlimited expenses & groups",
      others: "Capped at 4 expenses per day",
    },
    {
      feature: "Forced Wait Time",
      splitwiser: "0s — Instant logging",
      others: "10-second countdown delay",
    },
    {
      feature: "Pricing & Subscriptions",
      splitwiser: "100% Free forever (MIT)",
      others: "$39.99/year or $4.99/month Pro",
    },
    {
      feature: "Receipt Scans",
      splitwiser: "Unlimited (no paywall)",
      others: "Capped at 2 scans per day",
    },
    {
      feature: "Friends Need an Account?",
      splitwiser: "No — Instant 1-tap guest link",
      others: "Forced account signup & app install",
    },
    {
      feature: "Ads & Behavioral Tracking",
      splitwiser: "Zero ads, zero trackers",
      others: "In-feed banner & pop-up ads",
    },
    {
      feature: "Open Source & Self-Hostable",
      splitwiser: "Yes — MIT licensed on GitHub",
      others: "Closed proprietary black box",
    },
  ];

  return (
    <section id="comparison" className="py-20 bg-slate-50/80 border-b border-slate-200/60 scroll-mt-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 font-semibold px-3 py-1">
            Why We Built Splitwiser
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tired of daily limits and 10-second paywalls?
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Splitwise caps free users at just 4 expenses per day and forces a 10-second countdown timer on every single transaction. We built Splitwiser because sharing dinners, road trips, and rent with friends should never come with paywalls.
          </p>
        </div>

        {/* Mobile Swipe Notice */}
        <div className="flex sm:hidden items-center justify-end gap-1 text-[11px] font-medium text-slate-500 mb-2 px-1">
          <ArrowLeftRight className="size-3 text-teal-600" />
          <span>Swipe sideways to compare</span>
        </div>

        {/* Comparison Table Card with smooth horizontal scrolling */}
        <div className="rounded-2xl border border-slate-200/90 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60">
                  <th className="py-4 px-5 text-sm font-bold text-slate-700 w-[30%]">Feature</th>
                  <th className="py-4 px-5 text-sm font-extrabold text-teal-900 bg-teal-50/70 w-[35%] border-x border-teal-100">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-md bg-teal-600 text-[11px] font-bold text-white shadow-xs">
                        s.
                      </span>
                      <span>Splitwiser</span>
                    </div>
                  </th>
                  <th className="py-4 px-5 text-sm font-semibold text-slate-500 w-[35%]">
                    Splitwise & Others
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-900 text-xs sm:text-sm">
                      {row.feature}
                    </td>
                    <td className="py-4 px-5 bg-teal-50/25 border-x border-teal-100/60 font-medium text-teal-950 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                          <Check className="size-3.5" />
                        </div>
                        <span className="leading-snug">{row.splitwiser}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-500 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="size-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                          <X className="size-3.5" />
                        </div>
                        <span className="leading-snug">{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
