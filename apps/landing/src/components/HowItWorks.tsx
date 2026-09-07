import { Badge } from "@/components/ui/badge";
import { PlusCircle, Receipt, CheckCircle, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: PlusCircle,
      title: "Create a Group in Seconds",
      description:
        "Name your trip, dinner, or household and choose your currency. No password, no credit card, no waiting.",
    },
    {
      number: "02",
      icon: Receipt,
      title: "Drop Expenses as You Go",
      description:
        "Anyone in the group can log who paid and who split. Equal split or custom amounts — it takes less than 3 seconds.",
    },
    {
      number: "03",
      icon: CheckCircle,
      title: "Settle Up With Zero Math",
      description:
        "See exactly who owes whom. Splitwiser calculates the simplest repayment path so you can settle and move on.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-b border-slate-200/60 scroll-mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 font-semibold px-3 py-1">
            Simple 3-Step Flow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Splitwiser Works
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            No friction, no downloads required. Just share a link and start tracking expenses together immediately.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6 sm:p-8 space-y-4 hover:bg-white hover:shadow-sm hover:border-teal-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-200 group-hover:text-teal-200">
                    {step.number}
                  </span>
                  <div className="size-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                    <Icon className="size-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 pt-1">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-14 p-8 rounded-2xl bg-gradient-to-r from-teal-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div>
            <h3 className="text-2xl font-bold">Ready to split without the headache?</h3>
            <p className="text-teal-100/80 text-sm mt-1">
              Start your first group right now. No account required.
            </p>
          </div>
          <a
            href="https://dash.splitwiser.app"
            className={buttonVariants({
              size: "lg",
              className: "bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold px-6 shadow-md shrink-0",
            })}
          >
            <span>Launch Splitwiser</span>
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
