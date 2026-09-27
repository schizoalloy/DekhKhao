import { Accent, SectionHeading } from "@/components/ui/SectionHeading";
import { MenuToTable } from "./MenuToTable";

export function SolutionSection() {
  return (
    <section aria-labelledby="solution-title" className="relative bg-paper-deep/60 pt-24 md:pt-36">
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <SectionHeading
          id="solution-title"
          index="02"
          eyebrow="The solution"
          className="lg:col-span-8"
          title={
            <>
              Don’t make customers imagine their food. <Accent>Let them see it.</Accent>
            </>
          }
          lede="Your menu tells customers what the food is. DekhKhao turns that menu into an interactive visual experience — so they can see it, at its real size, before they order."
        />
      </div>
      <MenuToTable />
    </section>
  );
}
