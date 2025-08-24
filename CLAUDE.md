# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite project with Tailwind CSS v4. It's a minimal setup with:
- React 19 with TypeScript
- Vite for build tooling and dev server
- Tailwind CSS v4 for styling (configured via Vite plugin)
- ESLint with TypeScript and React-specific rules
- Standard Vite project structure with `src/` containing React components

## Common Commands

- `yarn dev` - Start the development server with HMR
- `yarn build` - Type-check with `tsc -b` then build for production with Vite
- `yarn lint` - Run ESLint on all files
- `yarn preview` - Preview the production build locally

## Architecture & Structure

- **Entry point**: `src/main.tsx` - Renders the App component into the root DOM element
- **Main component**: `src/App.tsx` - The primary React component (cleaned up, no default content)
- **Styling**: `src/index.css` - Contains only the Tailwind CSS import (`@import "tailwindcss"`)
- **Build configuration**: Uses Vite with the React plugin and Tailwind CSS v4 plugin
- **TypeScript configuration**: Uses project references with separate configs for app (`tsconfig.app.json`) and Node.js (`tsconfig.node.json`)
- **Linting**: ESLint configured with TypeScript, React Hooks, and React Refresh rules

The project follows Vite's standard conventions with public assets in `public/` and source code in `src/`. Tailwind CSS v4 is configured through the Vite plugin system.