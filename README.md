# Cream Tours Invoice Generator

React + Vite app: add line items, preview the invoice live, download it as a PDF.

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```
Requires Node.js 18+.

## Where things are
- `src/App.jsx`      form, state, PDF download
- `src/Invoice.jsx`  the invoice layout and totals maths
- `src/PalmTree.jsx` palm tree graphic
- `src/styles.css`   colours and layout (green: `--green`)
- `src/assets/logo.png` company logo (replace to change it)
