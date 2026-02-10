# Brief Vault

[Live Demo](https://bdnikko.github.io/BriefVault/) | [GitHub](https://github.com/BDNIKKO/BriefVault)

Creative brief manager. Full CRUD with vanilla JavaScript, no frameworks.

## What This Is

A tool for managing creative project briefs. Think design projects, brand work, app concepts. Each brief has a color palette, reference links, tags, and a status. You can search through them, filter by status, use templates to get started fast, or build one from scratch.

I wanted this to actually look and feel like something real — not just a basic CRUD app. Added dark/light mode, a tutorial that walks you through the app on first load, a template system, and a button that loads demo data so you can see the app in action without creating anything manually.

## How It Works

Three ES6 classes:

- `Brief` is the data model. Each one has a title, description, color palette, reference URLs, tags, and a status.
- `APIService` handles all the CRUD. It's set up for crudcrud.com but defaults to Local Storage so the app works offline with no setup. Flip one boolean in `app.js` to switch to the real API.
- `BriefVaultApp` is the main controller. Event listeners, rendering, tutorial flow, theme toggle, search/filter logic — all lives here.

Everything async uses async/await with try/catch. Just open `index.html` and it works.

## The Styling

Dark theme by default, kind of cyberpunk. JetBrains Mono for headers and labels, Inter for body text. The cards have animated gradient borders along the top and staggered entrance animations. Dark and light mode both work, and the transition between them is smooth because every color is a CSS variable.

No CSS frameworks. Grid for the cards, Flexbox for everything else. Works on mobile.

## Extra Features

- Tutorial system — 4 steps, shows on first load, you can skip it or pull it back up with the help button
- Templates — 6 project types that pre-fill the form (website, mobile app, branding, dashboard, e-commerce, gaming)
- Demo data — one button loads 6 sample briefs so you can explore without typing anything
- Dark/light mode with localStorage persistence
- Search across titles, descriptions, and tags, plus a status filter dropdown

## Running It

```bash
# just open it
start index.html

# or serve it
npx live-server
```

## Tech

Vanilla JavaScript ES6+ (classes, async/await, destructuring, template literals), HTML5, CSS3 (custom properties, Grid, Flexbox, keyframe animations, backdrop-filter), Google Fonts (Inter, JetBrains Mono). API-ready with crudcrud.com, Local Storage fallback built in.

## Files

```
index.html
styles.css
app.js
README.md
```

Built by Nicholas Moppert
