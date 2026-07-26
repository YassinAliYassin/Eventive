/*
 * Answers below are derived from claims already made elsewhere on this site
 * (owned inventory, generator range, guest capacity, coverage, one-business-day
 * quotes, D-2 build start). Keep them in sync if those claims change.
 *
 * TODO — the two entries flagged `needsReview` state commercial terms that are
 * NOT established anywhere else on the site. Confirm your real deposit,
 * cancellation, and booking-lead policy and edit them before launch.
 */

export interface Faq {
  id: string;
  question: string;
  answer: string;
  /** Marks an answer whose facts are not yet confirmed by the business. */
  needsReview?: boolean;
}

export const FAQS: Faq[] = [
  {
    id: "coverage",
    question: "Where in Zimbabwe do you operate?",
    answer:
      "We run nationwide from our Harare logistics hub, with established transport and rigging routes to Bulawayo, Victoria Falls, Nyanga, and Selous. We also build at private estates, homesteads, and courtyards that aren't on any venue list — if a truck can reach it, we can stage it.",
  },
  {
    id: "sub-hires",
    question: "Do you sub-hire any of your equipment?",
    answer:
      "No. Marquees, staging, line-array audio, lighting, generators, bar structures, and crew are all owned and operated by Eventive. That's what lets us guarantee condition and timing — there's no third party in the chain to miss a delivery window.",
  },
  {
    id: "load-shedding",
    question: "What happens if there's load-shedding during the event?",
    answer:
      "Every deployment carries silent diesel backup, sized between 10kVA and 45kVA against your actual power draw. The changeover is planned into the manifest, so kitchen, audio, and lighting stay up without an interruption your guests would notice.",
  },
  {
    id: "capacity",
    question: "How large an event can you handle?",
    answer:
      "Our sound and staging are specified for 100 to 1,500 guests, and our largest single deployment to date was 1,500. Smaller private gatherings run on the same crew standard — the manifest scales down, the discipline doesn't.",
  },
  {
    id: "roora",
    question: "Do you handle traditional Roora and Lobola celebrations?",
    answer:
      "Yes, and they're planned to their own run-of-show rather than being fitted into a wedding template. That covers homestead access, family seating, traditional catering including sadza and slow-roasted meats, and pacing that respects how the day is actually observed.",
  },
  {
    id: "setup",
    question: "How long before the event do you set up?",
    answer:
      "Structure assembly typically begins two days out, with lighting and sound tuning the day before, so the morning of the event is styling and final checks rather than construction. Longer builds are scheduled backwards from your start time and confirmed on the manifest.",
  },
  {
    id: "quote",
    question: "How quickly will I get a quote?",
    answer:
      "Send us the date, guest count, and occasion and our Harare team responds with a detailed logistics quote within one business day. The quote itemises structure, power, audio, lighting, staffing, and catering separately, so you can see exactly what each line costs.",
  },
  {
    id: "booking-lead",
    question: "How far in advance should I book?",
    answer:
      "TODO — confirm your real booking lead time and peak-season cut-offs before publishing this answer.",
    needsReview: true,
  },
  {
    id: "deposit",
    question: "What are your deposit and cancellation terms?",
    answer:
      "TODO — confirm your real deposit percentage, payment schedule, and cancellation window before publishing this answer.",
    needsReview: true,
  },
];
