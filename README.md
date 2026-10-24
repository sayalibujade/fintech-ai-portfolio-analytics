# AI-Powered Portfolio Analytics Dashboard (MEAN Stack)

A full-stack fintech application built with the MEAN stack, combining portfolio management, transaction processing, market-data streaming, and AI-assisted financial insights.

The application demonstrates domain-oriented Angular architecture, layered Node.js services, JWT-based authentication, financial business logic, and automated testing with 100% reported test coverage across the frontend and backend.

Key Features:

Portfolio management: Track investment holdings and portfolio-level analytics.

Transaction processing: Execute buy and sell operations with automatic holdings and weighted-average cost recalculation.

AI-powered insights: Generate portfolio-specific analytical insight cards using Google's Gemini SDK.

Market-data streaming: Deliver simulated market ticks to connected clients through Server-Sent Events (SSE).

Authentication and authorization: Protect application routes and APIs using JWT-based authentication.

Modular architecture: Separate frontend feature domains, backend request handling, business logic, and data models.

Automated testing: Jest-based test suites with 100% reported coverage for both frontend and backend.
---

## System Architecture

                    ┌─────────────────────────────────┐
                    │       Angular 22 Client         |
                    | Dahsboard | Portfolio | Insights|
                    |    Transactions | Authentication│
                    |────────────────────────────────┘
                                   │
                              REST / SSE 
                                   │
                     ┌──────────────▼───────────────────┐
                     │      Node 24 . Express 5         │
                     │ Routes | Controllers | Middleware|
                     |  Business Services               |           
                     └────┬────────┬────────┬───────────┘
                          │        │        │
            ┌─────────────▼─┐ ┌────▼───┐ ┌──▼───────────────┐
            │ MongoDB Atlas │ │ Gemini │ │ Market Data API  │
            │ (Data Stores) │ │ Engine │ │ (Simulated Feed) │
            └───────────────┘ └────────┘ └──────────────────┘

Technical Highlights:

1. Financial Business Logic

Transaction processing is separated from HTTP request handling through dedicated backend services.

Process buy and sell transactions.

Recalculate holdings and weighted-average cost after transactions.

Validate sell operations against available shares.

Handle domain errors such as INSUFFICIENT_SHARES and HOLDING_NOT_FOUND.

The portfolio service centralizes holding calculations and transaction-related business rules, making the logic easier to test and maintain.

2. AI-Assisted Portfolio Analytics

The application uses the @google/genai SDK to generate contextual insight cards based on portfolio information and available analytical inputs.

The AI layer is designed to provide portfolio-specific explanations rather than functioning solely as a generic chatbot.

Financial calculations should be performed and validated by application logic; AI-generated explanations are presented as analytical assistance rather than guaranteed financial advice.

3. Server-Sent Events (SSE)

A shared market-tick subscription and broadcast mechanism distributes simulated market updates to connected clients.

Uses SSE for server-to-client streaming.

Maintains active client connections and broadcasts market events.

Separates market-data delivery from frontend presentation.

Supports reactive consumption of streaming updates in Angular using RxJS.

The current feed is simulated for demonstration purposes and should not be interpreted as a live exchange-data feed.

4. Authentication and Security

JWT-based authentication for protected API endpoints.

Centralized authentication middleware and frontend HTTP interception.

Token handling encapsulated in a dedicated frontend TokenService.

Security considerations: The current client-side token-storage approach is intended for demonstration purposes. A production deployment would require a security review of token storage, expiration, revocation, XSS and CSRF exposure, authorization boundaries, and secret management. HttpOnly cookies may reduce exposure of credentials to JavaScript, but they do not eliminate application security risks.

5. Frontend Architecture

The Angular application separates shared infrastructure from feature-specific functionality.

Feature-oriented organization for authentication, portfolio, transactions, dashboard, market data, and AI insights.

RxJS for asynchronous workflows and market-data streams.

NgRx Signals for state management where appropriate.

ApexCharts for data visualization.

Shared components, pipes, and directives for reuse.

6. Testing Strategy

Both frontend and backend use Jest for automated testing.

Reported coverage: 100% for both applications.

Run the test suites and coverage reports:

cd backend
npm install
npm run test

cd ../frontend
npm install
npm run test

The coverage percentage should be interpreted alongside the tested scenarios and assertions. Important areas include transaction calculations, validation failures, authentication, error handling, and frontend state transitions.

Technology Stack

Layer

Technologies

Frontend

Angular 22, TypeScript, RxJS, NgRx Signals, ApexCharts

Backend

Node.js 24, Express 5, TypeScript

Database

MongoDB, Mongoose

AI

Google Gemini SDK (@google/genai)

Streaming

Server-Sent Events (SSE)

Testing

Jest

Project Structure

Backend

backend/
├── controllers/   # Request handling and response mapping
├── middleware/    # Authentication, validation and error handling
├── models/        # Mongoose schemas and data models
├── routes/        # API endpoint definitions
├── services/      # Business logic and external integrations
└── utils/         # Shared errors, constants and utilities

Frontend

frontend/src/app/
├── core/          # Shared infrastructure and authentication
├── features/
│   ├── ai-insights/
│   ├── auth/
│   ├── dashboard/
│   ├── market-data/
│   ├── portfolio/
│   └── transactions/
└── shared/        # Reusable UI components, pipes and directives

Getting Started

Prerequisites

Node.js 24.x

MongoDB local instance or accessible MongoDB deployment

Google Gemini API key for AI insights

Market-data API credentials only if the configured provider requires them

Backend Setup

cd backend
npm install

Create backend/.env:

PORT=3000
MONGO_URI=mongodb://localhost:27017/ai-trading
JWT_SECRET=replace_with_a_secure_random_secret
GEMINI_API_KEY=your_gemini_api_key
FINNHUB_API_KEY=your_market_provider_key

Configure only the environment variables required by your actual implementation. Keep .env files and credentials out of version control.

Start the backend:

npm run dev

Frontend Setup

Open a separate terminal:

cd frontend
npm install
npm start

Open http://localhost:4200 if that is the port configured by your Angular development server.

Future Engineering Work

Potential next steps include:

Structured observability: Add structured logging, request correlation, and operational monitoring.

State optimization: Evaluate broader NgRx Signal Store adoption where it simplifies state ownership and updates.

Transaction idempotency: Protect transaction creation against duplicate submissions and retry-related duplicate execution.

Database optimization: Add indexes based on measured query patterns and enforce appropriate uniqueness constraints.

Concurrency and consistency: Evaluate atomic updates or database transactions for concurrent portfolio mutations.

Deployment hardening: Review authentication, rate limiting, configuration, secret handling, and operational failure recovery.

Project Goals

This project demonstrates practical full-stack engineering through financial-domain business logic, modular architecture, reactive frontend development, API integration, streaming data, AI-assisted analytics, and automated testing.