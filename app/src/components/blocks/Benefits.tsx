import Image from "next/image";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Lead } from "@/components/ui/Lead";
import { Reveal } from "@/components/ui/Reveal";
import { Wrap } from "@/components/ui/Wrap";
import {
  BENEFITS,
  BENEFITS_IMAGE,
  BENEFITS_SECTION,
  type Benefit,
} from "@/lib/demo-content";

export type BenefitsImage = {
  src: string;
  alt: string;
};

export type BenefitsProps = {
  eyebrow?: string;
  title?: string;
  lead?: string;
  image?: BenefitsImage;
  items?: Benefit[];
};

const DEFAULTS: Required<BenefitsProps> = {
  ...BENEFITS_SECTION,
  image: BENEFITS_IMAGE,
  items: BENEFITS,
};

function BenefitIcon({ icon }: { icon: Benefit["icon"] }) {
  const common = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (icon) {
    case "person":
      return (
        <svg {...common}>
          <path
            d="M12 12a4 4 0 100-8 4 4 0 000 8zM5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <path
            d="M3 7h18v13H3zM8 7l1.5-3h5L16 7M12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path
            d="M4 19V9m5 10V5m5 14v-7m5 7V8"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path
            d="M6 3h9l4 4v14H6zM15 3v4h4M9 13h6M9 17h4"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );
    case "house":
      return (
        <svg {...common}>
          <path
            d="M4 10.5 12 4l8 6.5V20H4zM10 20v-6h4v6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "renovate":
      return (
        <svg {...common}>
          <path
            d="M3 20h18M6 20V9l6-4 6 4v11M10 20v-5h4v5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "scale":
      return (
        <svg {...common}>
          <path
            d="M12 4v16M5 9 12 4l7 5M4 20h6M14 20h6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export function Benefits({
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  lead = DEFAULTS.lead,
  image = DEFAULTS.image,
  items = DEFAULTS.items,
}: BenefitsProps = {}) {
  return (
    <section className="py-[92px] pb-[124px] max-sm:py-[66px] max-sm:pb-[84px]">
      <Wrap className="grid grid-cols-[1.12fr_0.88fr] items-center gap-[78px] max-lg:gap-[52px] max-md:grid-cols-1">
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mb-[22px] max-w-[18ch] text-[clamp(2rem,3.6vw,3.1rem)] max-sm:max-w-none">
            {title}
          </h2>
          <Lead>{lead}</Lead>
          <ul className="mt-[34px] grid list-none gap-6 max-sm:mt-7 max-sm:gap-5">
            {items.map((item) => (
              <li key={item.title} className="flex items-start gap-[18px]">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-strong max-sm:size-10">
                  <BenefitIcon icon={item.icon} />
                </span>
                <div>
                  <b className="mb-1.5 block text-[1.02rem]">{item.title}</b>
                  <p className="text-[0.94rem] leading-[1.6] text-muted">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={1} className="overflow-hidden rounded-arch">
          <div className="relative aspect-[4/5] max-md:aspect-[3/4]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 960px) 100vw, 44vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </Wrap>
    </section>
  );
}
