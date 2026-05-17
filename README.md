# Priority Pass

A modern, robust React 19 application built with Vite and TypeScript, featuring a professional-grade development workflow.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vite.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Linting:** [ESLint](https://eslint.org/) (with Type-Aware rules & React-specific plugins)
- **Formatting:** [Prettier](https://prettier.io/)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged)
- **Commit Standards:** [Commitlint](https://commitlint.js.org/) & [Commitizen](https://github.com/commitizen/cz-cli)

## 🛠️ Development Workflow

This project enforces high code quality and consistency through automated tooling:

- **Type-Aware Linting:** Catches logical errors using TypeScript type information.
- **Auto-formatting:** Prettier ensures a consistent coding style across the codebase.
- **Pre-commit Hooks:** Every commit is automatically linted and formatted before being accepted.
- **Conventional Commits:** Standardized commit messages are enforced via Commitlint.
- **Path Aliases:** Use `@/` to import from the `src` directory (e.g., `import { App } from '@/App'`).

## 🏁 Getting Started

### Prerequisites

Ensure you have [pnpm](https://pnpm.io/) installed.

### Installation

```bash
pnpm install
```

### Development

Start the development server with Hot Module Replacement (HMR):

```bash
pnpm dev
```

### Production Build

Build the application for production:

```bash
pnpm run build
```

### Linting & Formatting

Manual checks (though these run automatically on commit):

```bash
# Run ESLint
pnpm run lint

# Run Prettier
pnpm exec prettier --write .
```

### Making Commits

To ensure your commit messages meet the project's standards, use the interactive commitizen prompt:

```bash
pnpm run commit
```

## 📁 Project Structure

- `src/`: Application source code.
- `public/`: Static assets.
- `.husky/`: Git hook configurations.
- `eslint.config.js`: Modern ESLint flat configuration.
- `tsconfig.json`: TypeScript configuration with path aliases.
