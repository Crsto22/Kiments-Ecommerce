# KIMENTS UI Style Guide for Codex

Use this guide before changing visual UI in this Next 16 ecommerce app. Keep changes close to the existing component language and avoid broad redesigns unless explicitly requested.

## Project Stack

- App Router lives in `app/`.
- Shared components live in `components/`.
- shadcn-style primitives live in `components/ui/`.
- Tailwind v4 is configured through `@import "tailwindcss";` in `app/globals.css`.
- `cn()` is available from `@/lib/utils`.
- Validate UI changes with `npm.cmd run lint`; run `npm.cmd run build` for larger component or dependency changes.

## Typography

- Use Poppins for normal UI text. It is registered in `app/layout.tsx` as `--font-poppins` and applied globally in `app/globals.css`.
- Use the local brand font only for the KIMENTS wordmark or intentional brand marks:
  `font-[family-name:var(--font-kiments)]`.
- Do not use the brand font for legal, FAQ, about-page, product, form, or normal section headings unless the user explicitly asks.
- Prefer light visual weight for luxury/fashion surfaces:
  `font-light` for nav, footer, body labels, secondary headings, and buttons.
- For page titles that need stronger emphasis, prefer `font-medium` before `font-semibold`; avoid `font-bold` unless the user asks for a heavy title.
- Keep uppercase headings with restrained tracking, usually `tracking-[0.08em]` to `tracking-[0.14em]`.

## Icons

- Existing brand UI uses Phosphor icons.
- For server-rendered or navbar icons, prefer:
  `@phosphor-icons/react/dist/ssr`.
- For client components, existing files also use:
  `@phosphor-icons/react`.
- Prefer `weight="thin"` or `weight="light"` for visible controls. Use `regular` only when the icon needs more legibility.
- Do not replace existing Phosphor icons with another icon library just for style preference.
- `lucide-react` is present because shadcn's carousel component uses it internally in `components/ui/carousel.tsx`; use it for shadcn UI primitives when needed.

## Color and Surface Language

- The visual direction is clean fashion ecommerce: white space, black text, soft gray dividers, and photo-led sections.
- Common neutrals:
  - Black text and controls: `text-black`, `bg-black`
  - Primary dark button hover: `hover:bg-[#3d3d3d]`
  - Footer: `bg-[#3c3c3b]`
  - Soft beige/image backgrounds: `bg-[#eee9e2]`
  - Product/card fallback backgrounds: `bg-[#f2f2f2]`, `bg-[#f3f1f1]`
- Avoid decorative gradient blobs, heavy cards, and colorful palettes that distract from product photography.
- Prefer subtle borders like `border-black/10`, `border-white/65`, and `border-[#eeeeee]`.

## Components and Reuse

- Reuse these components before creating new one-off UI:
  - `components/Navbar.tsx`
  - `components/Footer.tsx`
  - `components/HeroCarousel.tsx`
  - `components/InstagramCarousel.tsx`
  - `components/PageLoader.tsx`
  - `components/KimentsLoader.tsx`
  - `components/ui/drawer.tsx`
  - `components/ui/carousel.tsx`
- For new reusable primitives, place them under `components/ui/` and follow the existing shadcn-style pattern:
  `"use client"` when interactive, `React.ComponentProps<...>` typing, `cn()` for class merging, and named exports.
- For composed business/marketing sections, place them in `components/` and import them into app pages.
- Do not create nested card layouts for page sections. Prefer full-width sections with constrained inner content.

## Buttons and Controls

- Buttons should be simple, rectangular, and fashion-oriented:
  `inline-flex h-12 items-center justify-center border px-9 text-sm font-light uppercase tracking-[0.14em]`.
- Avoid large rounded pills unless matching an existing component.
- Icon-only controls should be actual buttons with `aria-label`.
- Use hover states that invert or subtly darken: `hover:bg-black hover:text-white`, `hover:bg-white hover:text-black`, or `hover:text-black/70`.

## Images and Sections

- Use `next/image` for images.
- Product and Instagram imagery should be square or fixed aspect ratio with `object-cover`.
- Hero and banner sections should be image-led, not gradient-only.
- Keep image overlays subtle and functional for text contrast.
- For carousels, prefer the shared `components/ui/carousel.tsx` primitive instead of hand-rolled translate state.

## Next 16 Rule

This project uses a newer Next.js version with breaking changes. Before writing Next-specific code, read the relevant guide in `node_modules/next/dist/docs/`.

## Common Imports

```tsx
import { cn } from "@/lib/utils";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
```

## Review Checklist

- Poppins is used for normal text.
- The KIMENTS local font is only used for brand marks.
- Icons match the thin/light Phosphor look unless inside a shadcn primitive.
- Text fits on mobile and desktop.
- Sections feel clean, photo-led, and consistent with the existing ecommerce UI.
- `npm.cmd run lint` passes.
