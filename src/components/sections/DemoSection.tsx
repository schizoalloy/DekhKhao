import { ArrowUpRight, CubeFocus, DeviceMobileCamera, Ruler } from "@phosphor-icons/react/dist/ssr";
import { demo } from "@/content/demo";
import { Arch, Dots, Sparks, Wedge } from "@/components/brand/Shapes";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";
import { DemoVideo } from "./DemoVideo";

const points = [
  { icon: DeviceMobileCamera, text: "Point the phone camera at the table." },
  { icon: CubeFocus, text: "The dish appears where it would be served." },
  { icon: Ruler, text: "At its real-world size, so “12-inch” finally means something." },
];

/** "See it in action": the AR demo recording, plus a live dish visitors can try on their own phone. */
export function DemoSection() {
  const live = demo.liveDemo;
  return (
    <section id="demo" aria-labelledby="demo-title" className="relative overflow-hidden bg-teal py-24 text-cream md:py-32" data-expand>
      <div className="container-page relative grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        {/* phone */}
        <div className="relative lg:col-span-5 lg:col-start-1">
          <Arch className="absolute inset-x-[4%] bottom-[-6%] top-[14%] mx-auto h-auto w-[92%] lg:w-full" color="var(--color-teal-deep)" />
          <Wedge className="absolute -left-2 top-[6%] w-20 rotate-[-14deg] sm:left-[2%] sm:w-28" data-sticker="" data-speed="0.9" />
          <Dots className="absolute -right-1 top-[18%] w-16 sm:right-[4%] sm:w-20" data-sticker="" data-speed="-0.6" />
          <Sparks className="absolute right-[10%] top-[2%] w-12 rotate-[25deg]" data-sticker="" data-speed="1.3" />
          <div className="relative" data-demo-phone>
            <DemoVideo />
          </div>
          <p className="relative mx-auto mt-6 max-w-[38ch] text-center text-xs leading-relaxed text-cream/70">{demo.video.credit}</p>
        </div>

        {/* story */}
        <div className="lg:col-span-6 lg:col-start-7">
          <SectionHeading
            id="demo-title"
            tone="paper"
            title={
              <>
                See AR food preview <Accent>in action</Accent>
              </>
            }
            lede="Customers preview food at its real-world size using their phone camera. No app, no guesswork: the dish sits on their table before they order it."
          />

          <ul className="mt-10 space-y-5">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-4" data-reveal="">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream/10 text-yellow">
                  <Icon size={24} weight="duotone" aria-hidden />
                </span>
                <span className="pt-2 text-[1.02rem] leading-snug text-cream/90">{text}</span>
              </li>
            ))}
          </ul>

          {live && (
            <div className="mt-12 flex flex-col gap-6 rounded-[1.75rem] bg-cream p-6 text-charcoal sm:flex-row sm:items-center sm:p-7" data-reveal="">
              {/* QR is the desktop path; phones get the direct link below */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={live.qrSvg}
                alt={`QR code that opens the live AR demo pizza (${live.url})`}
                width={132}
                height={132}
                className="hidden size-[132px] shrink-0 rounded-xl sm:block"
              />
              <div>
                <p className="hand text-[1.9rem] leading-none text-teal">Try it yourself</p>
                <p className="mt-2 max-w-[34ch] leading-relaxed text-ink/85">
                  <span className="hidden sm:inline">Scan with your phone camera to</span>
                  <span className="sm:hidden">Open the demo on this phone to</span> place a pizza on your own table, at its real size.
                </p>
                <a
                  href={live.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-semibold text-teal underline decoration-orange decoration-2"
                >
                  Open the demo pizza
                  <ArrowUpRight size={16} weight="bold" aria-hidden />
                  <span className="sr-only">(opens ar-code.com in a new tab)</span>
                </a>
                <p className="mt-2 text-xs text-muted">{live.credit}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
