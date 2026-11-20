# Bryant Neighborhood Oral History

This React/vite code serves as a frontend prototype for an oral history project by/in the Bryant neighborhood of South Minneapolis.

The React site communicates via FastAPI with a PostgreSQL with PostGIS extension.

Auth is handled for now by offloading credential storage, MFA, and JWT issuance to Microsoft Entra External ID.


# Running locally

## Prerequisites

[Node.js](https://nodejs.org) (v18 or higher) and `npm` should be installed on your machine.

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Open the app**
   Visit `http://localhost:5173` (Vite) or `http://localhost:3000` (Create React App) in your browser.
