import { FaqAccordion, type FaqItem } from "./FaqAccordion";

export interface FaqSection {
  category: string;
  items: FaqItem[];
}

interface FaqSectionsProps {
  sections: FaqSection[];
}

export function FaqSections({ sections }: FaqSectionsProps) {
  return (
    <section className="px-7 py-20 sm:px-10 lg:px-16 lg:py-28 xl:px-20">
      <div className="mx-auto max-w-5xl">
        <div className="space-y-16 lg:space-y-24">
          {sections.map((section) => (
            <div key={section.category} className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <div>
                <h2 className="sticky top-24 text-lg font-medium tracking-[0.08em] text-black sm:text-xl">
                  {section.category}
                </h2>
                <div className="mt-4 h-[1px] w-12 bg-black/20 lg:hidden" />
              </div>

              <div className="w-full">
                <FaqAccordion items={section.items} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
