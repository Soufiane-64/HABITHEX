# HabitHex

> **A quiet, focused habit tracker for showing up every day.**

HabitHex is a mobile-first habit tracker designed for iPhone Safari. It uses a calm dark interface, warm editorial typography, and weekly hexagon history to make progress easy to see without adding noise.

No account. No backend. No subscription. Your habits stay on your device.

## ✦ What it does

- **Track daily habits** with one-tap completion
- **Record numeric goals** such as pages read or hours slept
- **Navigate by day** without losing your history
- **See your week at a glance** with Monday–Sunday hexagon indicators
- **Measure real streaks** from your saved check-ins
- **Track showing up** across all completed habit days
- **Create, edit, and delete habits** with custom schedules and targets
- **Undo accidental completions** with a lightweight toast action
- **Install on iPhone** through Safari’s Add to Home Screen flow

## ✦ Starter habits

HabitHex opens with three starter habits the first time it is launched:

| Habit | Goal | Schedule |
| --- | --- | --- |
| Reading | 20 pages | Every day |
| Gym | 1 workout | Monday, Tuesday, Thursday, Saturday |
| Sleep | 7 hours | Every day |

You can edit or remove these at any time.

## ✦ Run the app

### Requirements

- Node.js 18 or newer
- npm

### Development

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

### Deploy with Vercel

Import the repository into Vercel and keep the default settings:

- **Framework preset:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`

The build command invokes the TypeScript and Vite CLIs through Node directly, which keeps deployments reliable on Linux build machines.

## ✦ Use it on an iPhone

To open the app on your phone during development:

1. Connect the iPhone and computer to the same Wi-Fi network.
2. Start the development server with `npm run dev -- --host`.
3. Open the **Network** URL shown by Vite in Safari on the iPhone.
4. Tap **Share**.
5. Choose **Add to Home Screen**.

For the Home Screen experience to work reliably outside your local network, deploy the production build to an HTTPS host.

## ✦ Data and privacy

HabitHex is local-first. It does not send habit data to a server.

All habits and check-ins are stored in the browser under:

```text
habithex:v1
```

Clearing Safari website data or browser storage will remove the saved habits and check-ins. There is currently no cloud sync or account recovery.

## ✦ Technology

- React
- TypeScript
- Vite
- date-fns
- lucide-react
- Plain CSS with responsive design tokens
- `localStorage` persistence

## ✦ Project structure

```text
src/
├── App.tsx       # Dashboard, habit cards, forms, and interactions
├── data.ts       # Starter habits, local date keys, and persistence
├── types.ts      # Habit and check-in types
├── utils.ts      # Dates, schedules, progress, and streak calculations
├── main.tsx      # React entry point
└── styles.css    # Responsive visual system and animations
```

## ✦ Design principles

- Phone-first, with a centered desktop preview
- Touch targets sized for comfortable use
- Keyboard-visible focus states
- Accessible labels for icon-only controls
- Reduced-motion support
- Local calendar dates instead of UTC date keys
- No future check-ins

## License

This project is for personal use and experimentation.
