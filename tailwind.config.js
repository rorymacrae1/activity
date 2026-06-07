/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4: scan all source files for className usage
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],

  theme: {
    // ─── Breakpoints — aligned with layout.ts ────────────────────────────────
    screens: {
      md: "768px", // tablet (iPad portrait)
      lg: "1024px", // desktop (iPad landscape, laptops)
      xl: "1280px", // large desktop
    },

    extend: {
      // ─── Colors — translated from src/theme/colors.ts ──────────────────────
      colors: {
        // Brand identity
        "brand-primary": "#4A90A4", // Alpine Blue
        "brand-primary-muted": "#5AABDE",
        "brand-primary-subtle": "#D6EAF8", // Ice Blue cards
        "brand-primary-strong": "#326573",
        "brand-accent": "#C23B3B", // Signal Red (CTAs)
        "brand-accent-muted": "#E56B6B",
        "brand-accent-subtle": "#FEF5F5",

        // Canvas (page backgrounds)
        "canvas-default": "#F7F9FB", // Snow White
        "canvas-subtle": "#F1F4F8",
        "canvas-muted": "#E8ECF1",
        "canvas-inset": "#E5E7EB", // Glacier Grey
        "canvas-inverse": "#1E2A38", // Alpine Navy

        // Surface (cards, modals)
        "surface-primary": "#FFFFFF",
        "surface-secondary": "#F1F4F8",
        "surface-tertiary": "#D6EAF8", // Ice Blue for feature cards
        "surface-elevated": "#FFFFFF",

        // Ink (text and icons)
        "ink-rich": "#1A1A1A", // Charcoal — primary text
        "ink-normal": "#404040", // Body text
        "ink-muted": "#6B7280", // Mist Grey — secondary
        "ink-faint": "#9CA3AF", // Placeholder, hints
        "ink-disabled": "#9CA3AF",
        "ink-inverse": "#F7F9FB",
        "ink-on-brand": "#FFFFFF",

        // Border
        "border-subtle": "#E5E7EB", // Glacier Grey
        "border-default": "#D1D5DB",
        "border-strong": "#9CA3AF",
        "border-focus": "#4A90A4", // Alpine Blue focus ring
        "border-selected": "#4A90A4",

        // Interactive states
        "interactive-default": "#4A90A4",
        "interactive-hover": "#3D7A8C",
        "interactive-active": "#326573",
        "interactive-disabled": "#D1D5DB",

        // CTA
        "cta-primary": "#C23B3B", // Signal Red
        "cta-primary-hover": "#A32E2E",
        "cta-primary-active": "#862525",
        "cta-secondary": "#1E2A38", // Alpine Navy
        "cta-secondary-hover": "#2C3E50",

        // Sentiment
        "sentiment-success": "#22C55E",
        "sentiment-success-subtle": "#F0FDF4",
        "sentiment-warning": "#F59E0B",
        "sentiment-warning-subtle": "#FFFBEB",
        "sentiment-error": "#C23B3B",
        "sentiment-error-subtle": "#FEF5F5",
        "sentiment-info": "#4A90A4",
        "sentiment-info-subtle": "#F0F7FC",

        // Terrain (piste markers)
        "terrain-beginner": "#22C55E",
        "terrain-intermediate": "#3B82F6",
        "terrain-red": "#EF4444",
        "terrain-advanced": "#0F172A",

        // Match score
        "match-excellent": "#22C55E",
        "match-good": "#4A90A4",
        "match-fair": "#F59E0B",
        "match-poor": "#C23B3B",

        // Rank (podium)
        "rank-gold": "#F59E0B",
        "rank-silver": "#94A3B8",
        "rank-bronze": "#C4793A",
      },

      // ─── Spacing — translated from src/theme/spacing.ts ───────────────────
      spacing: {
        "2xs": "2px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
        "5xl": "96px",
        // Semantic aliases
        "inline-gap": "8px",
        "card-padding": "20px",
        "card-padding-lg": "28px",
        "stack-gap": "16px",
        "section-y": "32px",
        "screen-x": "20px",
        prose: "24px",
      },

      // ─── Font families — from src/theme/fonts.ts (Montserrat) ─────────────
      fontFamily: {
        "montserrat-light": ["Montserrat-Light"],
        "montserrat-light-italic": ["Montserrat-LightItalic"],
        "montserrat-regular": ["Montserrat-Regular"],
        "montserrat-italic": ["Montserrat-Italic"],
        "montserrat-medium": ["Montserrat-Medium"],
        "montserrat-semibold": ["Montserrat-SemiBold"],
        "montserrat-bold": ["Montserrat-Bold"],
      },

      // ─── Font sizes — from src/theme/typography.ts scale ──────────────────
      fontSize: {
        xs: ["11px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["15px", { lineHeight: "24px" }],
        md: ["17px", { lineHeight: "26px" }],
        lg: ["21px", { lineHeight: "28px" }],
        xl: ["26px", { lineHeight: "34px" }],
        "2xl": ["34px", { lineHeight: "42px" }],
        "3xl": ["48px", { lineHeight: "56px" }],
      },

      // ─── Letter spacing ────────────────────────────────────────────────────
      letterSpacing: {
        tight: "-1.5px",
        snug: "-1px",
        normal: "0px",
        wide: "0.2px",
        wider: "0.3px",
        widest: "1.2px",
      },

      // ─── Border radius — from src/theme/radius.ts ─────────────────────────
      borderRadius: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        xxl: "24px",
        full: "9999px",
        // Semantic
        button: "12px",
        input: "10px",
        card: "16px",
        modal: "24px",
        chip: "9999px",
        avatar: "9999px",
      },

      // ─── Max width — from src/theme/layout.ts ─────────────────────────────
      maxWidth: {
        prose: "680px",
        content: "960px",
        wide: "1200px",
        app: "1440px",
      },
    },
  },

  plugins: [],
};
