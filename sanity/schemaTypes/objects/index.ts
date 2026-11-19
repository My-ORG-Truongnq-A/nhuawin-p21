import { featureItem, messageFormBlock, processStep, sectionHeading, specRow } from "./blocks";
import { link } from "./link";
import { embed, figure } from "./media";
import { legacyId, redirect, seo } from "./seo";
import { blockContent, faq, simpleBlockContent } from "./text";

export { heroImageRule, ogImageRule } from "./media";

/** 13 object dùng chung theo content_model (+ embed là khối con của blockContent). */
export const objectTypes = [
  figure,
  seo,
  faq,
  redirect,
  legacyId,
  link,
  messageFormBlock,
  sectionHeading,
  featureItem,
  processStep,
  specRow,
  simpleBlockContent,
  blockContent,
  embed,
];
