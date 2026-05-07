# CSM OS

Local React prototype for six click based workflows using Zendesk Garden components.

## Install dependencies

1. Install Node.js 22 or newer.
2. Run `npm install`.

## Run locally

1. Run `npm run dev`.
2. Open the local URL shown in the terminal.

## Build for production

1. Run `npm run build`.
2. The production files are written to `dist`.
3. Run `npm run preview` to inspect the production build locally.

## MVP checklist

Implemented:

1. Home screen with six workflow tiles in the requested order.
2. Settings screen with local memory toggle off by default.
3. Reused workflow form screen for all six workflows.
4. Required field validation with Garden error styling.
5. Output screen with placeholder text, copy, save to file, and back controls.
6. Optional local storage for the last 10 generated outputs only when the setting is on.

Not implemented yet:

1. AI or model calls.
2. API keys or external service calls.
3. Editable output before copying.
4. Local model integration through Ollama or LM Studio.
