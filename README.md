# HabitHex

HabitHex is a mobile-first habit tracker built for Safari on iPhone. It stores habits and check-ins locally in the browser, so no account or backend is required.

## Run locally

```bash
npm install
npm run dev
```

Open the displayed local URL in Safari on the iPhone's network, then use **Share → Add to Home Screen**.

## Features

- Daily navigation with local-calendar date handling
- Numeric check-ins for goals such as pages and hours
- Boolean check-ins for session habits
- Weekly Monday-to-Sunday history
- Streak and showing-up calculations based on saved history
- Add, edit, and delete habits
- Responsive phone-first layout with install metadata for iOS

Data is saved under the `habithex:v1` localStorage key.
