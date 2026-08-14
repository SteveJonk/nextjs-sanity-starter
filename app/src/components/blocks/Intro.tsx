import Image from "next/image";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Lead } from "@/components/ui/Lead";
import { Reveal } from "@/components/ui/Reveal";
import { Wrap } from "@/components/ui/Wrap";
import { cn } from "@/lib/cn";
import { INTRO } from "@/lib/demo-content";

export type IntroImage = {
  src: string;
  alt: string;
};

export type IntroFact = {
  value: string;
  label: string;
};

export type IntroLink = {
  label: string;
  href: string;
};

export type IntroProps = {
  image?: IntroImage;
  stampValue?: string;
  stampLabel?: string;
  eyebrow?: string;
  title?: string;
  titleHighlight?: string;
  leads?: string[];
  facts?: IntroFact[];
  link?: IntroLink;
};

const DEFAULTS: Required<Omit<IntroProps, "titleHighlight" | "link">> &
  Pick<IntroProps, "titleHighlight" | "link"> = INTRO;

function renderHighlightedTitle(title: string, titleHighlight?: string) {
  if (!titleHighlight) {
    return title;
  }

  const index = title.indexOf(titleHighlight);
  if (index === -1) {
    return (
      <>
        {title}{" "}
        <em className="italic">{titleHighlight}</em>
      </>
    );
  }

  return (
    <>
      {title.slice(0, index)}
      <em className="italic">{titleHighlight}</em>
      {title.slice(index + titleHighlight.length)}
    </>
  );
}

export function Intro({
  image = DEFAULTS.image,
  stampValue = DEFAULTS.stampValue,
  stampLabel = DEFAULTS.stampLabel,
  eyebrow = DEFAULTS.eyebrow,
  title = DEFAULTS.title,
  titleHighlight = DEFAULTS.titleHighlight,
  leads = DEFAULTS.leads,
  facts = DEFAULTS.facts,
  link = DEFAULTS.link,
}: IntroProps = {}) {
  return (
    <section className="relative pt-[120px] pb-[130px] max-sm:py-[82px]">
      <Wrap
        className={cn(
          "grid grid-cols-[0.82fr_1.18fr] items-center gap-[86px]",
          "max-lg:gap-[50px] max-md:grid-cols-1 max-md:gap-14",
        )}
      >
        <Reveal className="relative">
          <div className="aspect-[4/5] overflow-hidden rounded-arch max-sm:aspect-[3/4]">
            <Image
              src={image.src}
              alt={image.alt}
              width={800}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
          <div
            className={cn(
              "absolute right-[-46px] bottom-[38px] grid size-[154px] place-items-center rounded-full bg-accent text-center shadow-stamp",
              "max-md:right-3 max-md:bottom-4 max-md:size-[112px]",
              "max-xs:size-24",
            )}
          >
            <div>
              <b
                className={cn(
                  "block font-display text-[1.9rem] leading-none font-normal",
                  "max-md:text-[1.55rem] max-xs:text-[1.35rem]",
                )}
              >
                {stampValue}
              </b>
              <small
                className={cn(
                  "mt-1.5 block text-[0.6rem] font-semibold tracking-[0.16em] text-muted",
                  "max-md:text-[0.56rem] max-md:leading-[1.4] max-md:tracking-[0.11em]",
                  "max-xs:text-[0.53rem] max-xs:tracking-[0.08em]",
                )}
              >
                {stampLabel}
              </small>
            </div>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mb-[26px] max-w-[17ch] text-[clamp(2.1rem,3.9vw,3.4rem)]">
            {renderHighlightedTitle(title, titleHighlight)}
          </h2>
          {leads.map((lead, index) => (
            <Lead key={index} className="mb-[18px]">
              {lead}
            </Lead>
          ))}
          <div
            className={cn(
              "my-9 mb-[34px] flex flex-wrap gap-11",
              "max-sm:my-[30px] max-sm:gap-x-7 max-sm:gap-y-[22px]",
            )}
          >
            {facts.map((fact) => (
              <div
                key={fact.value}
                className="max-w-[170px] max-sm:max-w-none max-sm:flex-1 max-sm:basis-[40%]"
              >
                <b className="mb-1 block font-display text-[1.9rem] font-normal max-sm:text-[1.6rem]">
                  {fact.value}
                </b>
                <span className="block text-[0.83rem] leading-normal text-subtle">
                  {fact.label}
                </span>
              </div>
            ))}
          </div>
          {link ? <ArrowLink href={link.href}>{link.label}</ArrowLink> : null}
        </Reveal>
      </Wrap>
    </section>
  );
}
