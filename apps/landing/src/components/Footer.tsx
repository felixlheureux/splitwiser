import { Heart, ExternalLink, ArrowRight } from "lucide-react";

export function Footer() {
  const buyMeACoffeeUrl =
    import.meta.env.VITE_BUY_ME_A_COFFEE_URL || "https://buymeacoffee.com/felixlheureux";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Support the Project Callout Box */}
        <div className="rounded-2xl bg-slate-800/80 border border-slate-700/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-xl">☕️</span>
              <h3 className="text-lg font-bold text-white">
                Support Splitwiser
              </h3>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">
              Splitwiser is 100% free and open source. If it saves you headaches splitting bills with friends, consider buying a coffee to support domain hosting and ongoing open-source development!
            </p>
          </div>

          {/* Official Buy Me a Coffee styled button */}
          <a
            href={buyMeACoffeeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#FFDD00] hover:bg-[#ffea38] text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.216 6.415l-.132-.666c-.119-.597-.388-1.162-.79-1.618-.403-.456-.913-.787-1.493-.974C17.065 2.915 15.7 2.7 12 2.7c-3.7 0-5.065.215-5.801.457-.58.187-1.09.518-1.493.974-.402.456-.671 1.021-.79 1.618l-.132.666C3.33 6.953 3 7.828 3 8.765c0 1.258.608 2.378 1.545 3.082.012.35.035.7.068 1.05.344 3.639 2.766 6.545 6.087 7.218V21.3h2.6v-1.185c3.321-.673 5.743-3.579 6.087-7.218.033-.35.056-.7.068-1.05.937-.704 1.545-1.824 1.545-3.082 0-.937-.33-1.812-.784-2.35zM12 4.7c3.486 0 4.636.19 5.21.375.326.105.613.29.84.545.226.255.378.57.444.908l.115.582c-.886.075-2.025.19-3.409.19H8.8c-1.384 0-2.523-.115-3.409-.19l.115-.582c.066-.338.218-.653.444-.908.227-.255.514-.44.84-.545.574-.185 1.724-.375 5.21-.375zm5.748 8.025c-.292 3.092-2.38 5.575-5.748 5.575s-5.456-2.483-5.748-5.575c-.03-.314-.05-.628-.061-.941h11.618c-.011.313-.031.627-.061.941zm1.252-2.94c-.453.34-.984.546-1.54.607-.035-.382-.086-.757-.152-1.125h.392c.602 0 1.09-.488 1.09-1.09 0-.602-.488-1.09-1.09-1.09-.328 0-.623.146-.822.378l-.133-.674c.48-.178 1.085-.314 1.955-.314.73 0 1.34.258 1.758.73.418.472.58 1.11.458 1.796-.104.582-.444 1.082-.916 1.382z" />
            </svg>
            <span>Buy me a coffee</span>
          </a>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pt-4">
          {/* Brand info */}
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-teal-600 text-xs font-bold text-white">
                s.
              </span>
              <span className="text-lg font-bold text-white tracking-tight">Splitwiser</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              The free forever, open-source group expense splitter. Zero friction, instant guest access, and no 10-second countdown paywalls. Built for the things we share.
            </p>
          </div>

          {/* App & Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Product
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://dash.splitwiser.app"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <span>Launch Web App</span>
                  <ArrowRight className="size-3" />
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-teal-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-teal-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-teal-400 transition-colors">
                  Why Splitwiser
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-teal-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Open Source & Community */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Open Source
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://github.com/felixlheureux/splitwiser"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <svg className="size-3.5 fill-current" viewBox="0 0 19 19" aria-hidden="true">
                    <use href="/icons.svg#github-icon" />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/felixlheureux/splitwiser/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Report an Issue</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/felixlheureux/splitwiser/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-teal-400 transition-colors"
                >
                  MIT License
                </a>
              </li>
              <li>
                <a
                  href={buyMeACoffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-yellow-400 transition-colors flex items-center gap-1.5"
                >
                  <span>☕️ Buy Me a Coffee</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Felix L'Heureux. Released under the MIT License.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="size-3 text-rose-500 fill-rose-500" /> for friends
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
