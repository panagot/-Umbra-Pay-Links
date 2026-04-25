/** In-page anchors for /demo — keep in sync with section `id`s. */
export const DEMO_ANCHORS = {
  retail: "demo-retail",
  agent: "demo-agent-402",
} as const;

export const DEMO_NAV_LINKS = [
  { href: `#${DEMO_ANCHORS.retail}`, label: "Retail" },
  { href: `#${DEMO_ANCHORS.agent}`, label: "402 → Umbra" },
] as const;
