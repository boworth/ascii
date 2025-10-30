# Bronswap Web Application

Next.js-based web application for Bronswap trading interface.

## Quick Start (SSH Server)

### Development Mode
```bash
cd WEBAPP
./start_dev.sh
```

### Production Mode (with optimized build)
```bash
cd WEBAPP
./start_production.sh
```

This will start the Next.js application:
- Development mode: port 6969
- Production mode: port 8080

Access at: 
- Dev: `http://daycanton02.elkcapitalmarkets.com:6969`
- Prod: `http://daycanton02.elkcapitalmarkets.com:8080`

## Remote Access via SSH Port Forwarding

If you need to access from your local machine:

**Development Mode:**
```bash
ssh -L 6969:localhost:6969 user@daycanton02
```
Then open `http://localhost:6969` in your browser.

**Production Mode:**
```bash
ssh -L 8080:localhost:8080 user@daycanton02
```
Then open `http://localhost:8080` in your browser.

## Manual Setup

### Install Dependencies

```bash
cd WEBAPP
npm install
```

### Development Server

```bash
npm run dev
```

Runs on `http://0.0.0.0:6969` (accessible remotely)

### Production Build and Start

```bash
npm run build
npm run start
```

## Technology Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Framer Motion animations
- **Language**: TypeScript

## Available Scripts

- `npm run dev` - Start development server on port 6969
- `npm run build` - Build production bundle
- `npm run start` - Start production server on port 8080
- `npm run lint` - Run ESLint

## Features

- Modern UI with animations
- Dark/light theme support
- Responsive design
- Server-side rendering with Next.js
- Optimized for production deployment

