import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-nav border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="size-8 rounded-xl bg-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-xs group-hover:scale-105 transition-transform">
            s.
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Splitwiser
            </span>
            <Badge variant="accent" className="hidden sm:inline-flex text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5">
              Free & Open Source
            </Badge>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-teal-600 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-teal-600 transition-colors">
            How It Works
          </a>
          <a href="#comparison" className="hover:text-teal-600 transition-colors">
            Why Splitwiser
          </a>
          <a href="#demo" className="hover:text-teal-600 transition-colors">
            Live Demo
          </a>
          <a href="#faq" className="hover:text-teal-600 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right CTA buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/felixlheureux/splitwiser"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "hidden sm:inline-flex text-slate-700 hover:text-slate-900 hover:bg-slate-100",
            })}
          >
            <svg className="size-4 fill-current" viewBox="0 0 19 19" aria-hidden="true">
              <use href="/icons.svg#github-icon" />
            </svg>
            <span>GitHub</span>
          </a>

          <a
            href="https://dash.splitwiser.app"
            className={buttonVariants({
              variant: "default",
              size: "sm",
              className: "bg-teal-600 hover:bg-teal-700 text-white shadow-sm font-medium",
            })}
          >
            <span>Open App</span>
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
