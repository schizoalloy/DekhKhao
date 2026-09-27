import { Reveal } from "@/components/ui/Reveal";
import { Accent, SectionHeading } from "@/components/ui/SectionHeading";
import Image from "next/image";
import { models, renders } from "@/content/assets";
import { ModelViewer } from "@/components/visuals/ModelViewer";
import { Reticle } from "@/components/visuals/Reticle";

const layers = [
  {
    title: "Every dish becomes a 3D model",
    body: "Each dish is captured as a detailed 3D model and measured, so the model matches the real dish.",
  },
  {
    title: "The phone finds the table",
    body: "The camera recognises flat surfaces, so the dish sits on the table instead of floating in the air.",
  },
  {
    title: "Shown at its real size",
    body: "Models are fixed to their real-world dimensions. A 12-inch pizza is 12 inches on the table — not “roughly pizza-sized”.",
  },
  {
    title: "Straight from the QR code",
    body: "Designed to open in the phone’s browser. Nothing for the customer to download.",
  },
];

/** Flat → 3D → on the table, as one continuous strip. */
function Pipeline() {
  const pizza = models.pizza;
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-paper/10 bg-[#211c18]">
      <div className="grid md:grid-cols-[1fr_1.35fr_1.35fr]">
        {/* 1. flat */}
        <figure className="relative flex flex-col items-center justify-center gap-5 border-b border-paper/10 p-8 md:border-b-0 md:border-r md:p-10">
          <div className="w-full max-w-[220px] rounded-xl bg-paper p-4 text-ink">
            <div className="flex items-center gap-3">
              <Image
                src={renders.pizzaTop.src}
                alt=""
                width={88}
                height={86}
                sizes="44px"
                className="size-11 shrink-0"
              />
              <div>
                <p className="text-sm font-medium">Pepperoni</p>
                <p className="font-mono text-[0.65rem] text-muted">12 inch</p>
              </div>
            </div>
          </div>
          <figcaption className="eyebrow text-paper/55">Menu</figcaption>
        </figure>

        {/* 2. model — live, rotatable scan */}
        <figure className="relative flex flex-col items-center justify-center gap-3 border-b border-paper/10 p-6 md:border-b-0 md:border-r md:p-8">
          <ModelViewer
            model={pizza}
            poster={renders.pizzaLow}
            alt="Rotatable 3D scan of a 12-inch pepperoni pizza"
            className="aspect-[4/3] w-full"
          />
          <figcaption className="flex flex-col items-center gap-1 text-center">
            <span className="eyebrow text-paper/55">3D model — drag to turn</span>
            <span className="font-mono text-xs text-saffron/90">
              {pizza.sizeCm.width.toFixed(1)} × {pizza.sizeCm.depth.toFixed(1)} × {pizza.sizeCm.height.toFixed(1)} cm
            </span>
          </figcaption>
        </figure>

        {/* 3. on the table */}
        <figure className="table-surface relative flex min-h-[300px] flex-col items-center justify-center p-8 pb-16 md:p-10 md:pb-16">
          <div className="relative flex w-[80%] max-w-[320px] items-center justify-center [perspective:700px]">
            <Reticle className="absolute aspect-square w-[108%] [transform:rotateX(58deg)]" />
            <Image
              src={renders.pizzaTilt.src}
              width={renders.pizzaTilt.width}
              height={renders.pizzaTilt.height}
              alt="The same scan placed on a restaurant table, at its real size"
              sizes="(min-width: 768px) 28vw, 80vw"
              className="relative w-full"
            />
          </div>
          <figcaption className="eyebrow absolute inset-x-0 bottom-6 text-center text-paper/75">
            Your table — {pizza.realSize}, actual size
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

export function TechnologySection() {
  return (
    <section aria-labelledby="tech-title" className="bg-ink py-24 text-paper md:py-36">
      <div className="container-page">
        <SectionHeading
          id="tech-title"
          index="05"
          eyebrow="The technology"
          tone="paper"
          title={
            <>
              Real food, in <Accent>real space.</Accent>
            </>
          }
          lede="DekhKhao combines 3D food visualization with smartphone augmented reality to bring menu items into the customer’s physical space."
        />

        <Reveal className="mt-14 md:mt-20">
          <Pipeline />
        </Reveal>

        <ul className="mt-14 grid gap-x-10 gap-y-2 md:mt-20 md:grid-cols-2">
          {layers.map((l, i) => (
            <Reveal as="li" key={l.title} delay={(i % 2) * 0.06} className="border-t border-paper/15 py-7">
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em] md:text-2xl">{l.title}</h3>
              <p className="mt-2 max-w-[46ch] leading-relaxed text-paper/65">{l.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
