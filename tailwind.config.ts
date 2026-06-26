import type { Config } from 'tailwindcss'

export default {
  darkMode: "class",
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        "secondary-container": "#0566d9",
        "inverse-surface": "#e5e2e1",
        "outline": "#958ea0",
        "error": "#ffb4ab",
        "on-primary-container": "#1a1a1a",
        "surface-variant": "#353534",
        "on-primary-fixed-variant": "#4a4a4a",
        "secondary-fixed": "#d8e2ff",
        "error-container": "#93000a",
        "on-tertiary-fixed": "#2c1700",
        "surface": "#131313",
        "on-error": "#690005",
        "tertiary-container": "#ca801e",
        "surface-dim": "#131313",
        "primary": "#e0e0e0",
        "secondary-fixed-dim": "#adc6ff",
        "inverse-on-surface": "#313030",
        "on-background": "#e5e2e1",
        "surface-container-high": "#2a2a2a",
        "on-tertiary-container": "#3f2300",
        "surface-container-lowest": "#0e0e0e",
        "on-secondary-fixed-variant": "#004395",
        "outline-variant": "#494454",
        "inverse-primary": "#a0a0a0",
        "surface-container": "#201f1f",
        "on-error-container": "#ffdad6",
        "on-primary-fixed": "#111111",
        "surface-tint": "#e0e0e0",
        "on-secondary-fixed": "#001a42",
        "primary-fixed-dim": "#e0e0e0",
        "on-tertiary-fixed-variant": "#673d00",
        "primary-fixed": "#f5f5f5",
        "tertiary": "#ffb869",
        "on-surface": "#e5e2e1",
        "tertiary-fixed-dim": "#ffb869",
        "on-secondary": "#002e6a",
        "on-surface-variant": "#cbc3d7",
        "surface-container-highest": "#353534",
        "surface-bright": "#393939",
        "on-tertiary": "#482900",
        "surface-container-low": "#1c1b1b",
        "on-primary": "#1a1a1a",
        "on-secondary-container": "#e6ecff",
        "primary-container": "#cccccc",
        "tertiary-fixed": "#ffdcbb",
        "secondary": "#adc6ff",
        "background": "#131313"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "container-padding": "24px",
        "stack-sm": "8px",
        "gutter": "16px",
        "unit": "4px",
        "stack-md": "16px",
        "stack-lg": "32px"
      },
      fontFamily: {
        "headline-lg": ["Inter"],
        "mono-sm": ["Geist"],
        "body-md": ["Inter"],
        "headline-sm": ["Inter"],
        "headline-md": ["Inter"],
        "body-lg": ["Inter"],
        "label-md": ["Geist"]
      },
      fontSize: {
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "mono-sm": ["13px", {"lineHeight": "18px", "fontWeight": "400"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "500"}],
        "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500"}]
      }
    }
  }
} satisfies Config
