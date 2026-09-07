import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      q: "Is Splitwiser really 100% free?",
      a: "Yes, completely free forever. Splitwiser is open-source under the MIT license. There are no subscriptions, no 'Pro' paywalls, no daily limits on how many expenses or receipts you can add, and no 10-second artificial countdown timers.",
    },
    {
      q: "Do my friends need an account or app download to join?",
      a: "No! Unlike other split apps that force everyone to download a 100MB app and register an email, Splitwiser is guest-first. You send an invite link (via WhatsApp, iMessage, Signal, or SMS); your friends open it in their browser, pick their name, and immediately view or add expenses.",
    },
    {
      q: "How do I install it on my iPhone or Android device?",
      a: "Splitwiser is built as an installable Progressive Web App (PWA). On iOS Safari, tap the Share icon and tap 'Add to Home Screen'. On Android Chrome, tap 'Install app' from the banner or browser menu. It opens in full-screen standalone mode with offline support.",
    },
    {
      q: "How does debt simplification work?",
      a: "When multiple friends pay for different things (e.g. Alice pays for dinner, Bob buys drinks, Charlie pays for gas), Splitwiser calculates each person's net balance and computes the mathematical minimum number of transfers to settle the entire group, eliminating messy circular repayments.",
    },
    {
      q: "Can I self-host Splitwiser on my own domain?",
      a: "Yes! The entire stack is built on Cloudflare Workers, Cloudflare D1 (SQL edge database), and Cloudflare Pages. It runs easily within Cloudflare's generous $0/month free tier. We provide complete OpenTofu/Terraform infrastructure scripts in the GitHub repo.",
    },
    {
      q: "How is Splitwiser funded?",
      a: "Splitwiser is an open-source passion project built for the community. The serverless architecture costs $0 to run. If you find it helpful and want to support domain costs and ongoing development, you can buy us a coffee using the button below!",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50/70 border-b border-slate-200/60 scroll-mt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <Badge variant="outline" className="text-teal-700 bg-teal-50 border-teal-200 font-semibold px-3 py-1">
            Questions & Answers
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            Everything you need to know about Splitwiser, privacy, and how it works.
          </p>
        </div>

        {/* Accordion list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-base text-slate-900 hover:text-teal-700">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
