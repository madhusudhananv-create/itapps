# AI Maturity Index Platform

A comprehensive React + TypeScript application for tracking and analyzing AI adoption maturity across different business units, accounts, and projects. The platform provides statistical analysis and insights to measure the effectiveness of AI tools and practices.

## Features

- **Activity Management**: Track AI maturity activities across different SDLC phases
- **Statistical Analysis**: Comprehensive dashboard with correlation analysis
- **AI Tools Analysis**: Detailed metrics for individual AI tools
- **Qualitative Benefits**: Analysis of benefits achieved through AI adoption
- **Correlation Insights**: Advanced insights into relationships between different metrics

## Tech Stack

### Frontend Framework

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server

### UI Framework & Components

- **Material-UI (MUI) v7** - React component library
- **Emotion** - CSS-in-JS styling solution
- **React Router DOM** - Client-side routing

### Backend & Database

- **Firebase** - Backend-as-a-Service
  - Firestore - NoSQL database

### Development Tools

- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Node.js** - JavaScript runtime

### Build & Deployment

- **Vite** - Build tool and bundler
- **Environment-based builds** - Separate configs for dev/prod

## Getting Started

### Prerequisites

- Node.js (v22 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

#### Development Build

```bash
npm run build
```

Uses `.env` file for development environment variables.

#### Production Build

```bash
npm run build:prod
```

Uses `.env.production` file for production environment variables.

#### Environment Files

- **`.env`** - Development environment variables
- **`.env.production`** - Production environment variables

Make sure to configure your environment files with the appropriate values before building.

## Project Structure

```
src/
├── features/
│   ├── activities/          # Activity management
│   ├── dashboard/           # Statistical analysis
│   └── auth/               # Authentication
├── shared/
│   ├── components/         # Reusable components
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript definitions
└── main.tsx               # Application entry point
```

## Contributing

When adding new statistical calculations:

1. **Document the formula** in the dashboard README (`src/features/dashboard/README.md`)
2. **Add TypeScript types** for new data structures
3. **Include unit tests** for mathematical functions
4. **Update the dashboard** to display new metrics
5. **Follow the established patterns** for consistency

## License

This project is licensed under the MIT License.
