import { steps } from "@/content/copy";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { QrGlyph } from "@/components/visuals/QrGlyph";
import { Reticle } from "@/components/visuals/Reticle";
import { ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { models, renders } from "@/content/assets";

const menu = ["Pepperoni", "Chicken karahi", "Seekh platter", "Gulab jamun"];

/** A small phone-screen vignette per step. */
function StepScreen({ step }: { step: number }) {
  return (
    <div className="relative mx-auto aspect-[9/14] w-full max-w-[220px] overflow-hidden rounded-[1.8rem] bg-ink p-1.5 shadow-[0_30px_50px_-30px_rgb(40_20_10/0.6)]">
      <div className="relative h-full w-full overflow-hidden rounded-[1.45rem] bg-paper">
        {step === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 [--qr-bg:var(--color-paper)]">
            <div className="relative size-[62%]">
              <QrGlyph className="size-full text-ink" />
              <span className="animate-scan-line absolute inset-x-[-6%] top-0 h-1/2 bg-gradient-to-b from-transparent to-chilli/35" />
              {[
                "left-[-8%] top-[-8%] border-l-2 border-t-2",
                "right-[-8%] top-[-8%] border-r-2 border-t-2",
                "bottom-[-8%] left-[-8%] border-b-2 border-l-2",
                "bottom-[-8%] right-[-8%] border-b-2 border-r-2",
              ].map((c) => (
                <span key={c} className={`absolute size-5 rounded-[3px] border-chilli ${c}`} />
              ))}
            </div>
            <span className="eyebrow text-muted">Table 7</span>
          </div>
        )}
        {step === 1 && (
          <div className="flex h-full flex-col p-4">
            <p className="eyebrow text-muted">Menu</p>
            <ul className="mt-3 space-y-2">
              {menu.map((name, i) => (
                <li
                  key={name}
                  className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-[0.72rem] ${
                    i === 0 ? "bg-ink text-paper" : "bg-ink/[0.05]"
                  }`}
                >
                  {i === 0 ? (
                    <Image src={renders.pizzaTop.src} alt="" width={64} height={62} sizes="28px" className="size-7" />
                  ) : (
                    <span className="size-7 rounded-full bg-ink/10" />
                  )}
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {step === 2 && (
          <div className="relative flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_45%,#fff_0%,var(--color-paper)_70%)] px-3">
            <p className="eyebrow absolute left-4 top-4 text-muted">3D view</p>
            <Image
              src={renders.pizzaLow.src}
              width={renders.pizzaLow.width}
              height={renders.pizzaLow.height}
              alt="3D scan of a pepperoni pizza in the 3D viewer"
              sizes="220px"
              className="w-full"
            />
            <p className="mt-5 flex items-center gap-1.5 text-[0.65rem] text-muted">
              <ArrowsClockwise size={13} aria-hidden /> Drag to turn
            </p>
          </div>
        )}
        {step === 3 && (
          <div className="table-surface relative flex h-full items-center justify-center [perspective:500px]">
            <span className="eyebrow absolute left-3 top-3 rounded-full bg-ink/60 px-2 py-1 text-[0.55rem] text-paper">AR</span>
            <Reticle className="absolute aspect-square w-[92%] [transform:rotateX(58deg)]" />
            <Image
              src={renders.pizzaTilt.src}
              width={renders.pizzaTilt.width}
              height={renders.pizzaTilt.height}
              alt="The pizza scan placed on a real table through the phone camera"
              sizes="220px"
              className="relative w-[84%]"
            />
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-paper px-3 py-1 font-mono text-[0.62rem] text-ink shadow">
              {models.pizza.realSize} · actual size
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="py-24 md:py-36">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading id="how-title" index="03" eyebrow="How it works" title="Scan. Choose. See. Place." className="lg:col-span-7" />
          <p className="max-w-[42ch] text-[1.05rem] leading-relaxed text-muted lg:col-span-4 lg:col-start-9">
            Four steps, all on the customer’s own phone, with nothing to install beyond a QR code. Ordering stays
            exactly as it is — DekhKhao only shows the food.
          </p>
        </div>

        <ol className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 md:mt-24 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 0.08} className={i % 2 === 1 ? "lg:mt-16" : ""}>
              <StepScreen step={i} />
              <div className="mt-8 border-t border-line pt-5">
                <p className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-chilli">{s.n}</span>
                  <span className="font-display text-3xl font-semibold tracking-[-0.03em]">{s.title}</span>
                </p>
                <p className="mt-2 max-w-[32ch] leading-relaxed text-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
