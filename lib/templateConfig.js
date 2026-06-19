// Maps target countries to a visual resume template style.
// This is what makes the PDF output feel "country-specific" rather than generic.

export const TEMPLATE_STYLES = {
  MODERN_MINIMAL: "modern_minimal",        // US, Canada, Australia, Singapore, etc.
  CLASSIC_PROFESSIONAL: "classic_professional", // UK, Ireland, Europe
  GLOBAL_DETAILED: "global_detailed",      // UAE, Gulf, South Asia, Africa
};

const COUNTRY_TEMPLATE_MAP = {
  "United States": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Canada": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Australia": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Singapore": TEMPLATE_STYLES.MODERN_MINIMAL,
  "New Zealand": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Germany": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Netherlands": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Sweden": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Malaysia": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Philippines": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Japan": TEMPLATE_STYLES.MODERN_MINIMAL,
  "South Korea": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Brazil": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Mexico": TEMPLATE_STYLES.MODERN_MINIMAL,
  "Argentina": TEMPLATE_STYLES.MODERN_MINIMAL,

  "United Kingdom": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,
  "Ireland": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,
  "France": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,
  "Italy": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,
  "Spain": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,
  "Portugal": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,
  "Poland": TEMPLATE_STYLES.CLASSIC_PROFESSIONAL,

  "UAE": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "India": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "Pakistan": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "Bangladesh": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "Sri Lanka": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "Nigeria": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "Kenya": TEMPLATE_STYLES.GLOBAL_DETAILED,
  "South Africa": TEMPLATE_STYLES.GLOBAL_DETAILED,
};

export function getTemplateForCountry(country) {
  return COUNTRY_TEMPLATE_MAP[country] || TEMPLATE_STYLES.MODERN_MINIMAL;
}

// Color/style tokens per template
// Western markets → Blue/Purple accent
// UK/Europe → Strong blue, formal typography
// Gulf/South Asia/Africa → Dark navy (reads as professional black)
export const TEMPLATE_THEME = {
  [TEMPLATE_STYLES.MODERN_MINIMAL]: {
    accent: "#6c63ff",
    sidebarBg: "#f4f3ff",
    textDark: "#1a1a1a",
    textMuted: "#6b6b6b",
    headerFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    layout: "single-column",
  },
  [TEMPLATE_STYLES.CLASSIC_PROFESSIONAL]: {
    accent: "#1e4d8c",
    sidebarBg: "#f0f4f8",
    textDark: "#1a1a1a",
    textMuted: "#5a5a5a",
    headerFont: "Times-Bold",
    bodyFont: "Times-Roman",
    layout: "single-column-formal",
  },
  [TEMPLATE_STYLES.GLOBAL_DETAILED]: {
    accent: "#1a1a2e",
    sidebarBg: "#f0f0f4",
    textDark: "#1a1a1a",
    textMuted: "#6b6b6b",
    headerFont: "Helvetica-Bold",
    bodyFont: "Helvetica",
    layout: "two-column-sidebar",
  },
};
