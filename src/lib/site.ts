export const SITE = {
  name: "FRX Technologies",
  shortName: "FRX",
  url: "https://frxtechnologies.com",
  title: "FRX Technologies | AI, Software & Digital Experiences",
  description:
    "Modern websites, AI automation and custom software built around real business needs.",
  philosophy: "Build smarter. Launch faster. Grow further.",
  statement: "Building the technology behind modern businesses.",
} as const;

export const SOCIAL = {
  instagram:
    "https://www.instagram.com/frx.technologies?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  linkedin: "https://www.linkedin.com/company/frx-technologies/?viewAsMember=true",
} as const;

/**
 * `image: null` means the portrait has not been supplied yet. The founders
 * section then renders a branded monogram panel of identical size and weight,
 * so the pair stays balanced.
 *
 * Declaring absence explicitly — rather than pointing at a path that 404s — is
 * what keeps the image optimizer from erroring on every render. Drop the file
 * in and set the path here; nothing else changes.
 */
export const FOUNDERS: {
  name: string;
  role: string;
  image: string | null;
}[] = [
  {
    name: "Feroze Mohiuddin",
    role: "Founder",
    image: "/images/founders/feroze-mohiuddin.png",
  },
  {
    name: "Raaef Usman",
    role: "Co-Founder",
    image: null,
  },
];

/** Only values that are true of FRX today. No invented client or revenue counts. */
export const CAPABILITY_STATS = [
  { value: 7, suffix: "", label: "Core service capabilities" },
  { value: 25, suffix: "+", label: "Technologies & platforms" },
  { value: 2, suffix: "", label: "Founders" },
] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
