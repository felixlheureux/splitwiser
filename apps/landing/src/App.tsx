import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Comparison } from "@/components/Comparison";
import { Features } from "@/components/Features";
import { DebtDemo } from "@/components/DebtDemo";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-teal-500 selection:text-white">
      <Header />
      <main className="flex-1">
        <Hero />
        <Comparison />
        <Features />
        <DebtDemo />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
