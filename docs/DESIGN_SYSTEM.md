# TILLAS.EC — Design System 2026

## Overview

This document outlines the modern UI/UX design principles and implementation guidelines for TILLAS.EC's mobile and web applications.

---

## 2026 Design Trends for Sneakers E-Commerce

### 1. Dark Mode First
- Dark backgrounds with vibrant accent colors
- Reduces eye strain and makes product images pop
- 78% of mobile users prefer dark mode (2026 survey)

### 2. Glassmorphism
- Frosted glass effects on cards and navigation
- Creates depth and modern aesthetic
- Works well with product showcases

### 3. Micro-Interactions
- Smooth animations on buttons and cards
- Haptic feedback on mobile
- Hover effects on web (subtle scale and shadow)

### 4. Large, Bold Typography
- Headlines: 32-48px, bold weights
- Body: 16-18px, readable sans-serif
- Product prices: 24-32px, high contrast

### 5. Immersive Product Displays
- 360° product views
- High-quality zoomable images
- "Try On" AR features (mobile)

### 6. Minimalist Checkout
- Single-page checkout flow
- Guest checkout as default
- Progress indicators with clear steps

### 7. Social Proof Integration
- Real-time "X people viewing" badges
- User-generated content galleries
- Influencer collaboration displays

---

## Color Palette

### Primary Colors
- **Tillas Red**: `#FF3B30` - Energy, passion, action
- **Deep Black**: `#0A0A0A` - Premium, sleek
- **White**: `#FFFFFF` - Clean, minimal

### Secondary Colors
- **Gray 900**: `#1C1C1E` - Dark mode backgrounds
- **Gray 800**: `#2C2C2E` - Cards, containers
- **Gray 700**: `#3A3A3C` - Borders, dividers

### Accent Colors
- **Gold**: `#FFD700` - Premium badges, loyalty
- **Teal**: `#00C7BE` - Success states
- **Orange**: `#FF9500` - CTAs, highlights

---

## Typography

### Font Family
- **Headlines**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: JetBrains Mono (for prices)

### Size Scale
```
xs:  12px
sm:  14px
base: 16px
lg:  18px
xl:  20px
2xl: 24px
3xl: 30px
4xl: 36px
5xl: 48px
```

---

## Component Guidelines

### Product Card (Mobile & Web)
```
┌─────────────────────────┐
│                         │
│   [Product Image]       │
│   (300x300, rounded)    │
│                         │
│  Brand Name             │
│  Product Name           │
│  $XX.XX                 │
│  [Size Selector]        │
│  [Add to Cart Button]   │
└─────────────────────────┘
```

### Key Features
- Dark mode optimized
- Hover effect: scale 1.02, shadow
- "New" badge with pulse animation
- Stock countdown timer

### Navigation Bar
```
┌─────────────────────────┐
│  [Logo]      [Search]   │
├─────────────────────────┤
│  Home | Drops | Cart    │
└─────────────────────────┘
```

### Bottom Navigation (Mobile)
```
┌────┬────┬────┬────┬────┐
│Home│Drops│Cart│Search│Profile│
└────┴────┴────┴────┴────┘
```

---

## Mobile-Specific Features

### 1. Pull-to-Refresh
- Smooth animation
- Shows "New drops" badge

### 2. Swipe Gestures
- Swipe left/right on product images
- Swipe up to load more
- Swipe down to refresh

### 3. Haptic Feedback
- Success: short vibration
- Error: double vibration
- Navigation: subtle tap

### 4. Push Notifications
- Drop alerts
- Order status updates
- Loyalty points reminder

---

## Web-Specific Features

### 1. Sticky Navigation
- Collapses on scroll
- Shows cart count badge
- Quick access to search

### 2. Product Comparison
- Side-by-side comparison
- Feature matrix
- Price comparison

### 3. Breadcrumb Navigation
- Home > Drops > Product
- Helps with SEO and UX

---

## Animation Guidelines

### Duration
- Short: 150-200ms (buttons)
- Medium: 300-400ms (modals)
- Long: 500-600ms (page transitions)

### Easing
- `ease-in-out` for most animations
- `cubic-bezier(0.4, 0, 0.2, 1)` for material design

### Key Animations
1. **Button Press**: Scale 0.95 → 1.0
2. **Card Hover**: Scale 1.02, shadow increase
3. **Page Transition**: Fade + slide
4. **Loading**: Skeleton screens with pulse

---

## Accessibility

### Contrast Ratios
- Text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Keyboard Navigation
- Full keyboard accessibility
- Focus indicators visible
- Skip links for navigation

### Screen Reader
- Proper ARIA labels
- Semantic HTML
- Alt text for all images

---

## Implementation Checklist

### Mobile (Expo/React Native)
- [ ] Dark mode theme implemented
- [ ] Glassmorphism cards
- [ ] Micro-interactions on all buttons
- [ ] Pull-to-refresh on home
- [ ] Swipe gestures for images
- [ ] Haptic feedback
- [ ] Push notifications
- [ ] AR try-on (optional)

### Web (Next.js)
- [ ] Dark mode toggle
- [ ] Sticky navigation
- [ ] Product comparison
- [ ] Breadcrumb navigation
- [ ] Image zoom on hover
- [ ] Quick view modals
- [ ] Breadcrumb navigation

---

## Design Tools

### Figma
- Main file: TILLAS.EC Design System
- Components library
- Dark mode variants
- Mobile wireframes

### Assets
- Product images: 3000x3000px min
- Brand logos: SVG format
- Icons: Heroicons or Lucide

---

## Next Steps

1. Create Figma design file
2. Implement dark mode theme
3. Build component library
4. Implement mobile screens
5. Implement web pages
6. Add animations
7. Test accessibility
8. User testing

---

## Resources

- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Figma Community](https://www.figma.com/community)
