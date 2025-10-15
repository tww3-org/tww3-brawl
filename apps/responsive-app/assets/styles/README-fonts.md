# Fonts Configuration

This document explains the font setup for the application.

## Available Font Families

### IBM Plex Sans
- **Primary font** for body text and UI elements
- **Available weights**: 100 (Thin), 200 (ExtraLight), 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- **Available styles**: Normal and Italic for each weight
- **Usage**: Default font for all text content

### CaslonAntique
- **Display font** for headings and emphasized text
- **Available weights**: 400 (Normal), 700 (Bold)
- **Available styles**: Normal and Italic for each weight
- **Usage**: Headings (h1-h6) and emphasized text

## SCSS Variables

```scss
$font-primary: 'IBMPlexSans', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
$font-display: 'CaslonAntique', 'IBMPlexSans', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

## Usage Examples

```scss
// Using primary font (IBM Plex Sans)
body {
  font-family: $font-primary;
  font-weight: 500; // Medium weight
}

// Using display font (CaslonAntique)
h1 {
  font-family: $font-display;
  font-weight: 700; // Bold weight
}

// Using specific font weight
.text-light {
  font-family: $font-primary;
  font-weight: 300; // Light weight
}

.text-bold {
  font-family: $font-primary;
  font-weight: 700; // Bold weight
}
```

## Font Files Location

- **IBM Plex Sans**: `~/assets/fonts/ibm-plex/`
- **CaslonAntique**: `~/assets/fonts/caslon-antique/`

All font declarations are centralized in `fonts.scss` for easy management.
