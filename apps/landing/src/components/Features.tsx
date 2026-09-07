import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Scale,
  Smartphone,
  ShieldCheck,
  Zap,
  HeartHandshake,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Users,
      badge: "Instant Join",
      title: "Zero Friction Guest Mode",
      description:
        "Create a group in 5 seconds. Share a link via WhatsApp, iMessage, or Signal. Friends can pick their name and start logging expenses with zero account setup.",
    },
    {
      icon: Scale,
      badge: "Smart Algorithm",
      title: "Optimal Debt Simplification",
      description:
        "No more complicated webs of 8 different repayments. Splitwiser runs graph-based debt simplification to reduce IOUs to the absolute minimum transfers.",
    },
    {
      icon: Smartphone,
      badge: "PWA Ready",
      title: "Installable Home-Screen App",
      description:
        "Add Splitwiser directly to your iOS or Android home screen without dealing with App Store downloads or 100MB app updates. Fast, standalone, and lightweight.",
    },
    {
      icon: ShieldCheck,
      badge: "Private & Safe",
      title: "Passwordless 6-Digit Codes",
      description:
        "No passwords to remember. Instant 6-digit email codes verify directly inside your installed app on iOS, Android, and desktop without annoying browser redirects.",
    },
    {
      icon: Zap,
      badge: "Edge Architecture",
      title: "Sub-50ms Global Speed",
      description:
        "Built on Cloudflare Workers and global D1 edge database. Fast page loads, real-time sync, and offline-resilient caching right at the network edge.",
    },
    {
      icon: HeartHandshake,
      badge: "Community First",
      title: "Free Forever, Made for Sharing",
      description:
        "100% open-source under the MIT license. No subscriptions, no artificial paywalls, no ads, and no selling your personal transaction data.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-b border-slate-200/60 scroll-mt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 font-semibold px-3 py-1">
            Built for Modern Sharing
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything you need. None of the bloat.
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Designed from the ground up to make splitting expenses as fast and stress-free as possible.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Card
                key={idx}
                className="group border border-slate-200/80 bg-white hover:border-teal-300 hover:shadow-md transition-all duration-200 rounded-2xl p-2"
              >
                <CardHeader className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <div className="size-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-medium text-slate-600">
                      {f.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900 pt-2">
                    {f.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600 leading-relaxed">
                    {f.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
