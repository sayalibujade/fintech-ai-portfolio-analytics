# AI-Powered Portfolio Analytics Dashboard (MEAN Stack)

An enterprise-ready **AI-driven portfolio management and market analytics dashboard** engineered using modern full-stack JavaScript. This system treats AI as a structural, deterministic analysis layer—generating contextual, data-driven analytical insights directly over live user portfolios—rather than a generic, chat-based conversational assistant. Built with strict architectural decoupling, domain-driven frontend isolation, and **100% test coverage using Jest**.

---

## System Architecture

                    ┌──────────────────────────┐
                     │   Angular 22 Client UI   │
                     │ (Dashboard / Analytics)  │
                     └─────────────┬────────────┘
                                   │
                     REST / SSE (Real-Time Streams)
                                   │
                     ┌─────────────▼────────────┐
                     │      Node 24 Server      │
                     │ (Express API & Routing)  │
                     └────┬────────┬────────┬───┘
                          │        │        │
            ┌─────────────▼─┐ ┌────▼───┐ ┌──▼───────────────┐
            │ MongoDB Atlas │ │ Gemini │ │ Market Data API  │
            │ (Data Stores) │ │ Engine │ │ (Simulated Feed) │
            └───────────────┘ └────────┘ └──────────────────┘

## Core Technical Features & Trade-offs

### Non-Chatbot AI Analytics Layer
Instead of implementing generic, conversational chat prompts, this platform processes stateful database portfolios alongside real-time market inputs via the native `@google/genai` SDK to generate deterministic, actionable **AI Insight Cards**. These cards programmatically synthesize portfolio health metrics, risk concentrations, performance trajectories, and shifting macro conditions.

### Orchestrated Domain State Mutations
Data updates follow a modular service orchestration design. When an execution command triggers an asset event inside `Transaction.ts`, immediate downstream calls delegate to dedicated computation routines inside `portfolioService` (`processBuy` / `processSell`). 
**Dynamic Recalculations:** Automatically computes updated asset holdings and weighted-average parameters (`totalCost / totalShares`) instantly.
**Defensive Boundary Guards:** Protects integrity boundaries using unified internal operational checks (`INSUFFICIENT_SHARES`, `HOLDING_NOT_FOUND`) before execution strings finish.

### Broadcast-Hub Market Data Streaming (SSE)
Market tickers utilize a custom-engineered, multi-client Server-Sent Events (SSE) broadcast architecture:
**Decoupled Subscription Loop:** The application initializes a single functional background routine (`subscribeToMarketTicks`) at the module layer to protect system resources from thread starvation.
**Multi-Client Broadcast Engine:** The Express router manages an active array pool of persistent client sockets (`res`), using standard protocol streams (`text/event-stream`) to concurrently pipe tick snapshots downward the millisecond volatility events fire.
**Fintech Performance Benefits:** Avoids the heavy bi-directional frames and handshake overhead of WebSockets, shields downstream clients from API vendor lock-in, and bypasses third-party vendor rate-limiting completely during deployment presentations.

### Enterprise Security Architecture Note
**Design Consideration:** For local execution and ease of hosting deployment in this portfolio demonstration, JWTs are handled via an abstract client-side `TokenService` writing to browser storage. In a true production fintech system, this architecture is dropped in favor of backend-issued, stateless **HttpOnly, SameSite=Strict cookies** to completely decouple credentials from the JavaScript runtime execution layer, eliminating Cross-Site Scripting (XSS) compromise vectors.

---

## Technology Stack & Project Structure

**Frontend:** Angular 22, NgRx Signals, ApexCharts, RxJS, Jest
**Backend:** Node.js 24 (ESM), Express 5, Mongoose, Google Gemini SDK, Jest
**Database:** MongoDB

### Backend Architecture (`Node 24` + `Express`)
backend/
├── controllers/          # Request validation, response orchestration, and payload mapping
├── middleware/           # Unified JWT authentication and global centralized async error-handling
├── models/               # Strongly-typed Mongoose Schemas (User, Portfolio, Transaction, Market)
├── routes/               # Modular Express API endpoint mappings 
├── services/             # Pure Domain Core logic (Gemini AI parsing, transaction aggregations, market routers)
└── utils/                # Standardized functional utilities (AppError classes, global constants)

### Frontend Architecture (`Angular 22`)
frontend/src/app/
├── core/                 # App-wide Singletons (Route guards, JWT interceptors, layout architecture, global models)
├── features/             # Isolated Domain Slices
│   ├── ai-insights/      # Insight engine pages, AI services, markdown parsing pipes
│   ├── auth/             # Login/Signup forms and dedicated Authentication API abstractions
│   ├── dashboard/        # Main overview layout and real-time ApexCharts rendering wrappers
│   ├── market-data/      # RxJS-powered Server-Sent Event (SSE) streaming state services
│   ├── portfolio/        # Portfolio cards, deep-dive detail views, and localized state stores
│   └── transactions/     # Multi-step transactional forms, ledgers, and history state tables
└── shared/               # Reusable UI component atoms, pipes, and directives

## Testing Strategy (100% Coverage)
This system implements full automated testing coverage metrics across every single logical controller, routing boundary, validation middleware, and data service layer utilizing **Jest**.

```bash
# Backend Test Suite (Compiles TS & runs coverage metrics with environment overrides)
cd backend && npm run test

# Frontend Test Suite (Executes unit test layers via Jest runner)
cd frontend && npm run test
```

---

## Setup & Installation Instructions

### Prerequisites
Node.js **v24.x** or higher (with native environment file support)
Active local or cloud instance of **MongoDB**

### Backend Setup
1. Change into backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the root of the backend directory containing your credentials:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/ai-trading
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_google_gemini_api_key
   FINNHUB_API_KEY=your_market_provider_key
   ```
3. Run the development environment with hot-reload and debugger enabled:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Change into frontend directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Spin up the local development web server:
   ```bash
   npm start
   ```
3. Access the application client live at `http://localhost:4200`.

---

## Future Engineering Backlog

**Structured Semantic Observability:** Integrate structured JSON streaming output loggers (`Winston` or `Pino`) across critical backend infrastructure entrypoints for standard enterprise audit trail compliance.
**State Performance Tuning:** Migrate localized Angular component states entirely to NgRx Signal Stores for granular, zoneless change-detection updates.
** Transactional Idempotency Protection:** Implement an idempotency-key validation middleware layer on the transaction creation endpoint to eliminate double-billing risks during network retry loops.
** Database Index Optimization:** Introduce compound, value-ordered database indexes (`{ userId: 1, symbol: 1 }`) across data collections to safeguard read speeds under heavy scale.