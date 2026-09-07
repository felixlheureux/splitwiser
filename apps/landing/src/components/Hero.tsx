import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
  Smartphone,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
} from "lucide-react";

export function Hero() {
  const [activeTab, setActiveTab] = useState<"balances" | "expenses">("balances");

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/60 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50">
      {/* Background subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial from-teal-100/50 via-teal-50/20 to-transparent pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="flex justify-center px-2">
            <Badge
              variant="accent"
              className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/80 rounded-2xl sm:rounded-full shadow-xs whitespace-normal text-center max-w-full leading-snug"
            >
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-teal-600 shrink-0" />
                <span>100% Free Forever</span>
              </span>
              <span className="hidden sm:inline text-teal-400">·</span>
              <span>No Subscriptions</span>
              <span className="text-teal-400">·</span>
              <span>No Ads</span>
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
            Split expenses with friends.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
              Without the friction.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
            The free, open-source alternative to bloated expense apps. No 4-expense daily caps, no 10-second countdown paywalls, and no forced account creation for your friends.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://dash.splitwiser.app"
              className={buttonVariants({
                size: "lg",
                className: "w-full sm:w-auto h-12 px-7 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 hover:shadow-lg transition-all",
              })}
            >
              <span>Start Splitting — It's Free</span>
              <ArrowRight className="size-4" />
            </a>

            <a
              href="https://github.com/felixlheureux/splitwiser"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "w-full sm:w-auto h-12 px-6 text-base font-medium border-slate-300 text-slate-700 hover:bg-white hover:border-slate-400",
              })}
            >
              <svg className="size-4 fill-current" viewBox="0 0 19 19" aria-hidden="true">
                <use href="/icons.svg#github-icon" />
              </svg>
              <span>View on GitHub</span>
            </a>
          </div>

          {/* Trust Metrics Pill Bar */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="size-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Clock className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">0s Artificial Delays</p>
                <p className="text-[11px] text-slate-500">No 10s wait paywalls</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Zap className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">$0 Cost Forever</p>
                <p className="text-[11px] text-slate-500">Zero subscriptions</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="size-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                <Users className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">1-Tap Guest Join</p>
                <p className="text-[11px] text-slate-500">No forced account signups</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
              <div className="size-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Smartphone className="size-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Home-Screen PWA</p>
                <p className="text-[11px] text-slate-500">iOS & Android offline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Mockup */}
        <div className="mt-14 max-w-3xl mx-auto">
          <div className="relative rounded-2xl bg-white p-2 sm:p-4 shadow-xl shadow-slate-200/60 border border-slate-200">
            {/* Mock browser / app header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-100 mb-4 bg-slate-50/70 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="size-3 rounded-full bg-red-400/80" />
                  <div className="size-3 rounded-full bg-amber-400/80" />
                  <div className="size-3 rounded-full bg-emerald-400/80" />
                </div>
                <span className="text-xs font-medium text-slate-500 ml-2">
                  dash.splitwiser.app/groups/summer-roadtrip
                </span>
              </div>
              <Badge variant="accent" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                Live Preview
              </Badge>
            </div>

            {/* Mock Group Card Header */}
            <div className="px-3 sm:px-5 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">Summer Road Trip 🌲</h3>
                    <Badge variant="secondary" className="text-xs font-normal">4 members</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Total group spending: $620.00 CAD</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("balances")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === "balances"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Balances & Settle
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("expenses")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === "expenses"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Recent Expenses
                  </button>
                </div>
              </div>

              {/* Tab Content: Balances */}
              {activeTab === "balances" ? (
                <div className="py-4 space-y-4">
                  {/* Debt Simplification Highlight Box */}
                  <div className="rounded-xl bg-teal-50/70 border border-teal-200/70 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                        ⚡️
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-teal-900 uppercase tracking-wide">
                          Smart Debt Simplification
                        </p>
                        <p className="text-sm font-medium text-teal-950">
                          Bob pays Felix <strong>$45.00</strong> to settle all group debts
                        </p>
                      </div>
                    </div>
                    <Button size="xs" className="bg-teal-600 hover:bg-teal-700 text-white shrink-0 self-end sm:self-auto">
                      Settle Up
                    </Button>
                  </div>

                  {/* Member balances list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold">
                          FL
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Felix (You)</p>
                          <p className="text-xs text-slate-500">Paid $320 for AirBnB cabin</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                        + $165.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-semibold">
                          AL
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Alice</p>
                          <p className="text-xs text-slate-500">Paid $180 for Groceries</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                        + $25.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-semibold">
                          BO
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Bob</p>
                          <p className="text-xs text-slate-500">Owes for cabin & groceries</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                        - $145.00
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-xs font-semibold">
                          CH
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Charlie</p>
                          <p className="text-xs text-slate-500">Paid $120 for Gas & Park passes</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                        - $45.00
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Lakeview Cabin Airbnb</p>
                      <p className="text-xs text-slate-500">Paid by Felix · Split equally (4 people)</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">$320.00</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Costco BBQ & Drinks</p>
                      <p className="text-xs text-slate-500">Paid by Alice · Split equally (4 people)</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">$180.00</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Gas & National Park Passes</p>
                      <p className="text-xs text-slate-500">Paid by Charlie · Split equally (4 people)</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900">$120.00</span>
                  </div>
                </div>
              )}

              {/* Bottom preview footer bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  Synced in real time via Cloudflare D1
                </span>
                <span className="font-medium text-teal-700">Zero wait to log expenses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
