# Hmmm is that right? 🔎📰

A modern web application designed for quick **fact checking**. This project aims to be a marketplace for information exchange where news sources meet readers, automating the cross-checking process by scraping related articles from multiple sources.

## How it Works

The application performs the following steps to automate fact-checking:

1.  **Input**: The user enters a news statement or claim into the UI search bar.
2.  **Source Selection**: Users can toggle between active and inactive news sources (e.g., BBC, New York Times, Reuters, AP).
3.  **Search**: The UI sends the statement and active sources to the backend, which performs Google search queries via **SerpAPI**.
4.  **Scraping**: The backend fetches the raw HTML content from the identified URLs.
5.  **Parsing**: Raw HTML is parsed into structured `NewsPiece` objects (Source, Title, Author, Date, Body) using source-specific CSS selectors.
6.  **Display**: Normalized results are returned to the UI and displayed in a table for easy cross-referencing and fact-checking.

### Visual Overview

- **Landing Page**: ![UI image](https://github.com/OrionMat/Hmm-is-that-right/blob/master/apps/client/public/UI_landing.png?raw=true)
- **Search & Source Selection**: ![UI search image](https://github.com/OrionMat/Hmm-is-that-right/blob/master/apps/client/public/UI_search.png?raw=true)
- **Results Table**: ![UI results table](https://github.com/OrionMat/Hmm-is-that-right/blob/master/apps/client/public/UI_results.png?raw=true)

---

## Technical Architecture

The project is structured as a **monorepo** using modern TypeScript 5.x tooling:

```text
Hmm-is-that-right/
├── apps/
│   ├── client/           # React Frontend (Vite)
│   └── server/           # Express Backend (Node.js)
├── .github/
│   └── workflows/        # CI/CD (GitHub Actions)
└── package.json          # Root workspace definition
```

### Tech Stack

- **Frontend**: React 19, Vite, styled-components 6.3, React Router v6.
- **Backend**: Node.js (>=22), Express 5, Axios, Zod (Validation), Pino (Logging), JSDOM (Parsing).
- **Search API**: SerpAPI (Google Search interface).
- **Testing**:
  - **Unit/Integration**: Vitest, Testing Library.
  - **E2E**: Playwright with Page Object Model (POM) pattern.

---

## Getting Started

### Prerequisites

- Node.js >= 22
- A free API key from [SerpAPI](https://serpapi.com/)

### Installation & Setup

1.  **Clone the project**:
    ```bash
    git clone https://github.com/OrionMat/Hmm-is-that-right.git
    cd Hmm-is-that-right
    ```
2.  **Install dependencies**:
    ```bash
    # Root level
    npm install
    # Or individually
    cd apps/client && npm install
    cd ../server && npm install
    ```
3.  **Environment Configuration**:
    Copy `apps/server/.env.example` to `apps/server/.env` and fill in your keys:

    ```env
    # Required for Fact Check (Google Search via SerpAPI)
    SERP_SEARCH_API_KEY=<your-serpapi-key>

    # Required for NewsBytes LLM summarisation
    GEMINI_API_KEY=<your-gemini-key>

    # Required for Morning Brief (Claude Sonnet 4.6)
    ANTHROPIC_API_KEY=<your-anthropic-key>

    # Optional
    OPENAI_API_KEY=<your-openai-key>
    LOG_LEVEL=info
    ```

4.  **Morning Brief personalisation context** (optional but recommended):
    ```bash
    cp apps/server/context/personalContext.example.md apps/server/context/personalContext.md
    # Edit personalContext.md with your CTO route-plan, current projects, and life priorities
    ```
    This file is gitignored — it is never committed.

---

## Running the Project

### Development Mode

Run these in separate terminals:

- **Server**:
  ```bash
  cd apps/server
  npm run dev
  ```
- **Client**:
  ```bash
  cd apps/client
  npm run dev
  ```

### Production Build

```bash
# Server
cd apps/server
npm run build
npm start

# Client
cd apps/client
npm run build
npm run preview
```

---

## Testing Strategy

The project employs a comprehensive testing strategy covering unit, integration, and end-to-end tests.

### Frontend Testing (Client)

- `npm test` - Runs Vitest unit and component tests.
- `npm run type-check` - Verifies TypeScript types.

### Backend Testing (Server)

- `npm run test` - Runs Vitest suite (includes mocked integrations and fixture HTML).
- `npm run typecheck` - Verifies TypeScript types.

### End-to-End (E2E) Testing

We use **Playwright** for full browser automation, testing across Chromium, Firefox, and Webkit.

- **POM Pattern**: Locators and actions are kept in Page Object Models (e.g., `tests/models/LoginPage.ts`), while assertions stay in the test files.
- **Best Practices**:
  - Use `page.getByRole` or `page.getByText` instead of CSS classes.
  - Use Web-First Assertions (`await expect(locator).toBeVisible()`) for auto-retries.
  - Avoid hard waits (`page.waitForTimeout`); wait for specific states or network requests.
  - Use `page.route()` to mock API calls for integration tests.

**E2E Commands** (inside `apps/client`):

- `npx playwright test` # Runs the end-to-end tests.
- `npx playwright test --ui` # Starts the interactive UI mode.
- `npx playwright test --project=chromium` # Runs the tests only on Desktop Chrome.
- `npx playwright test example` # Runs the tests in a specific file.
- `npx playwright test --debug` # Runs the tests in debug mode - very useful!
- `npx playwright codegen` # Auto generate tests with Codegen.

---

## CI/CD Pipeline

A GitHub Actions workflow (`.github/workflows/ci.yml`) is configured to:

1.  Install dependencies.
2.  Build the code.
3.  Run linting checks.
4.  Execute unit tests (`npm run test:unit`).
5.  Execute integration tests (`npm run test:integration`).
6.  Execute E2E tests (`npm run test:e2e`).

The CI job fails if any of these steps fail, ensuring code quality before merging.

---

## Roadmap & TODOs

### Morning Brief — Known Limitations & Future Work

- [ ] **Seen-content tracking**: Paul Graham essays and other non-daily sources can repeat across runs. A simple "seen list" (JSON file storing seen URLs) would prevent repetition.
- [ ] **Token-level streaming**: The SSE stream currently delivers each section as a complete payload. Per-token streaming (using Claude's streaming API) would make the UI feel more alive.
- [ ] **Personalisation UI**: The `personalContext.md` file is currently edited manually. A simple textarea on the Morning Brief page that saves to the server would be more convenient.

### Upcoming Features

- [ ] **Stance Detection**: Integrate ChatGPT API to summarize articles and detect agreement/disagreement between sources.
- [ ] **Infrastructure**: Deploy on AWS using CloudFormation/Terraform.
- [ ] **Architecture**: Integrate Next.js for better routing and SEO.
- [ ] **Containers**: Package backend with Docker for consistent environments.
- [ ] **Micro-frontends**: Explore `single-spa` for modular UI development.
- [ ] **UI/UX**: Implement AI-assisted form filling for the Sign-Up/Profile page.

### Maintenance

- [ ] Update HTML parsing selectors periodically as news site structures change.
- [ ] Improve state management as the application grows.
- [ ] Integrate TurboRepo for better monorepo management.

### Other TODOs (need looking into)

- exactly what I want to know each morning.
- great blog on auto research.
- great blog on adding ai asist bug triaging with swipe right or left (building ai-powered github issue triage with the copilot sdk)
- make a memory improvement part of the app
- interview prepper ai agent
- messaging
- linting rules, what linting rules would be good to implement
- think up a crazy hard feature to add to my app and start building it out 30 min moon shot, get lucky build something crazy with ai, like something crazy hard learning | build for the model 1 year away, like figure out how to build ai cyber ciso, or anything that is classicaly very hard and requires specific knowlege but can be done on a computer through language
- Claude session - catch you up on everything you've missed since that last time you got your morning brief. "You last read X, since then Y, Z has happened". Continuity. (Currently on a branch)
- What are the top ~20 seminal works (Like the Principia, Attention Is All You Need, Shannon's '48 paper, Watson & Crick, etc.). I'm looking for a list of the timeless curated cannon. See chat: https://chatgpt.com/c/69ff606b-1c60-8325-93e6-ea30d061c75c (and 'A Computer Scientist's Guide to Cell Biology.')
- How did I not hear about open claw earlier? What do I need to do to get on top of this info gap?
- Project specific podcasts, suggestions, etc. Personalized content.
- Use agent internet search & summarize mode.
  - Prompts: What have been the biggest headline news stories of the month? Could get the full list of stories, de-duplicate them, and then prioritize them in terms of impact to civilization? The output I'm looking for is a condensed list of bulletpoints with high signal and low everyday noise.
