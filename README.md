# Priority Pass

**Priority Pass** is a modern, offline-first Progressive Web App (PWA) designed to elegantly manage and display your flight boarding passes. Built with cutting-edge web technologies, it allows you to scan, import, parse, and store your boarding passes directly on your device, ensuring you have access to your travel documents even without an internet connection.

## Key Features

- **Universal BCBP Parsing**: Robustly parses IATA Bar Coded Boarding Pass (BCBP) strings to extract passenger details, flight information, dates, and PNRs.
- **Advanced Barcode Scanning**: Scan physical or digital boarding passes using your device's camera (powered by `@zxing/browser`), or directly import screenshots with an integrated image cropping tool (`react-image-crop`).
- **Offline-First PWA**: Fully installable on iOS and Android devices. Utilizes Service Workers and Workbox to securely cache application assets, boarding pass data, and local airline logos for lightning-fast offline access.
- **Dynamic Premium UI**:
  - Automatically extracts dynamic color palettes from airline logos using `node-vibrant` to create beautiful, personalized boarding pass cards.
  - Implements the modern Web View Transitions API for seamless, app-like morphing animations between pages.
  - Custom fluid swipe-to-dismiss interactions for toasts.
- **Built-In Local Databases**: Includes comprehensive, locally-served databases for 1,000+ airlines (with offline logos) and over 7,000 international airports. This ensures privacy, complete offline reliability, and zero external network latency.

## Tech Stack

### Core

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)

### Styling & UI

- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Icons**: [Material Icons](https://react-icons.github.io/react-icons/icons/md/)
- **Typography**: [Google Sans Variable](https://fontsource.org/fonts/google-sans)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

### Specialized Libraries

- **Barcode Parsing**: `bcbp`
- **Barcode Rendering**: `bwip-js` (Generates Aztec, PDF417, QR, and Data Matrix)
- **Camera Scanning**: `@zxing/browser` & `@zxing/library`
- **Color Extraction**: `node-vibrant`
- **Image Cropping**: `react-image-crop`

## Development Workflow

This project strictly enforces high code quality and consistency through automated tooling:

- **Type-Aware Linting**: Catches logical errors using ESLint.
- **Auto-formatting**: Prettier ensures a consistent coding style across the codebase.
- **Pre-commit Hooks**: Every commit is automatically linted and formatted using Husky and `lint-staged`.
- **Conventional Commits**: Standardized commit messages are enforced via Commitlint and Commitizen.
- **Path Aliases**: Use `@/` to import from the `src` directory (e.g., `import { App } from '@/App'`).

## Building and Running

- **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) (v24+) and [pnpm](https://pnpm.io/) installed.
- **Installation**: Clone the repository and install dependencies using `pnpm install`.
- **Development**: Run `pnpm dev` to start the local development server with Hot Module Replacement (HMR).
- **Production Build**: Run `pnpm build` to build the application and generate the PWA Service Worker. You can preview it locally using `pnpm preview`.
- **Making Commits**: Run `pnpm commit` to use the interactive commitizen prompt, ensuring your commit messages meet the project's standards.

## Project Structure

| Path                 | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `public/`            | Static assets, service worker, offline logos and databases |
| `src/components/`    | Reusable React components (Boarding Passes, Dialogs)       |
| `src/components/ui/` | Shadcn UI primitives                                       |
| `src/lib/`           | Utilities (Formatters, Helpers, Color extractors)          |
| `src/pages/`         | Route components (Home, PassDetail)                        |
| `src/store/`         | Zustand state stores (Local storage persistence)           |
| `src/index.css`      | Tailwind and global overrides                              |
| `src/main.tsx`       | Application entrypoint                                     |
