# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Hmm is that right?" is a fact-checking web application that automates cross-checking news statements across multiple sources. Users enter a statement, select news sources, and the app scrapes and displays related articles for comparison.

## Architecture

This is a full-stack TypeScript application with separate client and server directories:

### Client (React SPA)
- **Location**: `client/src/`
- **Framework**: React 19 with React Router v6
- **Styling**: styled-components 6.3
- **Build**: Vite 6.2.5 with TypeScript 5.9.3
- **Testing**: Vitest with Testing Library
- **Key Structure**:
  - `pages/` - Route pages (FactCheck is the main feature page)
  - `components/` - Reusable UI components (SearchBar, ResultsTable, Tile, LoadingSpinner, etc.)
  - `navigation/` - AppRoutes.tsx defines all routes with nested routing via AppNavigation
  - `service/` - API client for backend communication
  - `dataModel/` - TypeScript interfaces shared with backend

### Server (Express API)
- **Location**: `server/src/`
- **Framework**: Express with Pino logging
- **Build**: TypeScript compiled to `server/build/`
- **Key Structure**:
  - `index.ts` - Express server with single endpoint `/getNewsPieces`
  - `service/getNewsPieces.ts` - Main orchestration flow:
    1. `googleSearch()` - Search using SerpAPI (changed from ScaleSerp)
    2. `cleanUrls()` - Filter and deduplicate URLs
    3. `scrapePageHtml()` - Fetch HTML from URLs
    4. `parseHtml()` - Extract article data (title, author, date, body)
  - `integration/` - External API integrations (googleSearch, scrapePageHtml)
  - `dataModel/` - TypeScript interfaces (NewsPiece, etc.)

### Data Flow
1. User enters statement + selects news sources in client
2. Client calls `/getNewsPieces?statement=...&sources=...`
3. Server searches Google via SerpAPI for relevant articles
4. Server scrapes and parses article HTML
5. Server returns array of NewsPiece objects
6. Client displays results in ResultsTable component

## Development Commands

### Server
**Working directory**: `server/`

- **Build**: `npm run build` (compiles TypeScript to `build/`)
- **Start**: `npm run start` (builds and runs on port 3001)
- **Dev mode**: `npm run dev` (watches TS files with nodemon)
- **Test**: `npm test` (runs Jest tests)

### Client
**Working directory**: `client/`

- **Start dev server**: `npm run dev` (runs Vite on port 3000)
- **Build**: `npm run build` (TypeScript check + Vite production build)
- **Preview**: `npm run preview` (preview production build)
- **Test**: `npm test` (runs Vitest in watch mode)
- **Test (CI)**: `npm run test:run` (runs Vitest once)
- **Type check**: `npm run type-check` (runs TypeScript compiler check)

## Environment Setup

The server requires a `.env` file in the `server/` directory:
```
SERP_SEARCH_API_KEY=<your-serpapi-key>
```

**Note**: The project was migrated from ScaleSerp to SerpAPI. The README mentions ScaleSerp but the code uses `google-search-results-nodejs` (SerpAPI).

## Important Notes

- **Monorepo structure**: Client and server are independent npm packages with separate `node_modules/`
- **CORS**: Server has permissive CORS settings (`Access-Control-Allow-Origin: *`)
- **Routing**: Client uses React Router v6 with nested routes. Most pages are placeholder `<div>` elements except FactCheck and SignUp
- **TypeScript**: Both use strict mode (TS 5.9.3 on client, older on server). Server outputs to `server/build/`, client builds with Vite
- **Logging**: Server uses Pino with pretty-printing
- **Static serving**: Server serves built client files from `client/build/` at root path
- **SVG Imports**: Client uses vite-plugin-svgr - SVG imports use `?react` suffix (e.g., `import Icon from './icon.svg?react'`)

## Future Plans (from README TODO)
- Mock server integration for testing
- AWS deployment via CloudFormation
- ChatGPT API integration for stance detection and summarization
- Single-spa for micro-frontend architecture
