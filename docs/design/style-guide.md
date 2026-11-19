# Style Guide (MVP)

Version: 1.2
Date: 19 November 2026
Owner: Saumya (UI/UX Designer), updated with Development Team

Keeps all UniConnect screens consistent (NFR-6). It applies to the wireframes in `wireframes.md`. Values are kept in one place in the code (CSS variables) so another institution can change the colours without touching every page (NFR-11).

## 1. Colours

| Use | Name | Hex |
|---|---|---|
| Main colour (header, primary buttons, links) | Primary blue | #00408d |
| Page background | Light grey | #F5F7FA |
| Cards, forms, tables | White | #FFFFFF |
| Main text | Dark grey | #1F2937 |
| Secondary text | Mid grey | #4B5563 |
| Borders | Border grey | #D1D5DB |
| Errors and delete | Red | #B91C1C |

All text and button colours above have a contrast ratio of at least 6:1 against their background, which is readable on phones and in bright light.

## 2. Complaint status colours

| Status | Text | Background |
|---|---|---|
| Pending | #92400E | #FEF3C7 |
| In Progress | #1E40AF | #DBEAFE |
| Resolved | #166534 | #DCFCE7 |

Status is always shown as a small rounded label with the status written in words. Colour alone is never the only signal.

## 3. Typography

- Font: the system font (Segoe UI, Roboto, Helvetica, Arial, sans-serif), so no font files need to load (NFR-9).
- Page title: 24 px, bold.
- Section heading: 18 px, bold.
- Body text and table text: 16 px, regular.
- Small text (dates, hints): 14 px, mid grey.
- Line height 1.5 for body text.

## 4. Buttons

| Type | Look | Use |
|---|---|---|
| Primary | Primary blue background, white text | Main action on a screen: Login, Submit, Save, Publish |
| Secondary | White background, blue border and text | Cancel, View, Edit |
| Danger | Red background, white text | Delete, Deactivate |

- Height at least 44 px so buttons are easy to tap on a phone.
- One primary button per screen.
- Delete and Deactivate always ask for confirmation first.

## 5. Forms

- Label above every field, never only a placeholder.
- Required fields are marked with an asterisk.
- Errors appear in red directly under the field, in plain words that say what to fix, for example "Marks must be between 0 and max marks" (NFR-7).
- After a successful save, a green confirmation message shows at the top of the page.
- The user's typed text stays in the form after an error, so nothing is lost (NFR-8).

## 6. Layout and spacing

- Spacing unit: 8 px. Use multiples (8, 16, 24, 32).
- Header: primary blue, white text, 56 px high, app name on the left, user name and Logout on the right.
- Left menu: 220 px wide on desktop. The current page is highlighted.
- Cards: white, 1 px border, 8 px rounded corners, 16 px padding.
- Tables: header row in light grey with bold text, thin lines between rows.

## 7. Responsive rules (NFR-5)

| Screen width | Layout |
|---|---|
| 768 px and wider (desktop, tablet) | Left menu always visible, cards in two columns |
| Under 768 px (phone) | Menu collapses to one menu button, cards in one column, tables scroll sideways |

## 8. Multi-Theme Design Showcase Architecture (NFR-11)

UniConnect incorporates a modular CSS custom properties architecture (`/css/themes/`) enabling instant, client-side switching between distinct UI aesthetics without page reload:

| Theme Name | Identifier | Primary Accent | Background Palette | Aesthetic & Tone |
|---|---|---|---|---|
| **SAU Official Blue** | `sau-official` | `#00408d` | `#F5F7FA` & `#FFFFFF` | Institutional, authoritative university navy. |
| **SAU Midnight Dark** | `sau-dark` | `#38BDF8` | `#080E1A` & `#0F172A` | Sleek slate dark mode with neon cyan highlights. |
| **Heritage Collegiate** | `collegiate-crimson` | `#7A0019` | `#FAF7F2` & `#FFFFFF` | Ivy League / Oxbridge academic prestige with warm gold (`#C5A059`). |
| **Futuristic Neo-Emerald** | `neo-emerald` | `#059669` | `#F0FDF4` & `#ECFDF5` | Glassmorphic, modern vibrant emerald and cyan gradients. |

* **Theme Switcher:** Managed by `/js/theme-switcher.js` via `document.documentElement.setAttribute('data-theme', theme)` and persisted in `localStorage`.
* **Accessible Switcher Dropdown:** Embedded in `/partials/header.ejs` with active theme color swatch indicators.

## 9. Change log

| Version | Date | Change | Author |
|---|---|---|---|
| 1.0 | 18 Nov 2026 | Initial style guide | Saumya |
| 1.1 | 19 Nov 2026 | Updated primary blue to official South Asian University navy blue (#00408d) | Vikryansh |
| 1.2 | 19 Nov 2026 | Added Section 8 documenting the 4 Designer Themes and theme switcher engine | Vikryansh |