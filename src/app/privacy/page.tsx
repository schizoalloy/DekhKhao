import type { Metadata } from "next";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { WhatsAppCTA } from "@/components/sections/WhatsAppCTA";
import { siteConfig } from "@/config/site";
import { policyIntro, policySections, policyUpdated, type PolicyBlock } from "@/content/privacy";

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `How ${siteConfig.name} handles information when you use the website or a restaurant experience powered by ${siteConfig.name}.`,
  alternates: { canonical: "/privacy" },
  openGraph: { title: `Privacy Policy — ${siteConfig.name}`, url: "/privacy" },
};

function Block({ block }: { block: PolicyBlock }) {
  if ("h3" in block) return <h3 className="mt-8 font-display text-lg font-semibold tracking-[-0.015em]">{block.h3}</h3>;
  if ("ul" in block)
    return (
      <ul className="mt-4 space-y-2 pl-5 marker:text-chilli [list-style:disc]">
        {block.ul.map((li) => (
          <li key={li} className="pl-1">
            {li}
          </li>
        ))}
      </ul>
    );
  if ("ol" in block)
    return (
      <ol className="mt-4 space-y-2 pl-6 marker:font-mono marker:text-sm marker:text-chilli [list-style:decimal]">
        {block.ol.map((li) => (
          <li key={li} className="pl-1">
            {li}
          </li>
        ))}
      </ol>
    );
  return <p className="mt-4 whitespace-pre-line">{block.p}</p>;
}

const anchor = (n: number) => `section-${n}`;

function Contents({ className = "" }: { className?: string }) {
  return (
    <ol className={`space-y-0.5 text-sm ${className}`}>
      {policySections.map((s) => (
        <li key={s.n}>
          <a
            href={`#${anchor(s.n)}`}
            className="grid min-h-9 grid-cols-[2rem_1fr] items-baseline gap-1 rounded-lg py-1.5 text-ink/70 transition-colors hover:text-ink"
          >
            <span className="font-mono text-xs text-muted">{String(s.n).padStart(2, "0")}</span>
            <span>{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="pb-24 pt-28 md:pb-36 md:pt-36">
        <div className="container-page">
          <header className="max-w-3xl">
            <p className="eyebrow flex items-center gap-3 text-muted">
              <span className="text-chilli">Legal</span>
              <span aria-hidden className="h-px w-8 bg-current opacity-40" />
              {siteConfig.name}
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
              Privacy Policy
            </h1>
            <p className="mt-5 font-mono text-sm text-muted">
              Last Updated: <time dateTime="2026-09-27">{policyUpdated}</time>
            </p>
          </header>

          <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
            {/* contents: sticky list on desktop, collapsible on phones */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <nav aria-label="Privacy Policy contents" className="lg:sticky lg:top-28 lg:max-h-[calc(100dvh-8rem)] lg:overflow-y-auto lg:pr-2">
                <details className="group rounded-2xl border border-line lg:hidden">
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between px-5 font-medium">
                    Contents
                    <span aria-hidden className="text-xl transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <Contents className="px-4 pb-4" />
                </details>
                <div className="hidden lg:block">
                  <p className="eyebrow mb-4 text-muted">Contents</p>
                  <Contents />
                </div>
              </nav>
            </aside>

            <article className="max-w-[68ch] text-[1.02rem] leading-relaxed text-ink/80 lg:col-span-8 xl:col-span-7 xl:col-start-5">
              <div className="border-b border-line pb-10">
                {policyIntro.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </div>

              {policySections.map((s) => (
                <section key={s.n} id={anchor(s.n)} aria-labelledby={`${anchor(s.n)}-title`} className="scroll-mt-28 border-b border-line py-10">
                  <h2
                    id={`${anchor(s.n)}-title`}
                    className="flex items-baseline gap-3 font-display text-2xl font-semibold tracking-[-0.025em] text-ink md:text-[1.75rem]"
                  >
                    <span className="font-mono text-sm font-normal text-chilli">{String(s.n).padStart(2, "0")}</span>
                    {s.title}
                  </h2>
                  {s.blocks.map((b, i) => (
                    <Block key={i} block={b} />
                  ))}
                  {s.n === 24 && <WhatsAppCTA className="mt-6 min-h-12 px-5" />}
                </section>
              ))}

              <footer className="pt-10">
                <p className="font-medium text-ink">
                  {siteConfig.name} by {siteConfig.company}
                </p>
                <p className="mt-1 font-serif text-2xl italic text-chilli">“{siteConfig.tagline}”</p>
              </footer>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
