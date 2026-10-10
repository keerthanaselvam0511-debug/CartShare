# CartShare – Collaborative Real-Time Group Shopping

A front-end web app where roommates or friends share one grocery cart,
see who added what, and print a receipt with a per-person split.

## Features
- Create an account and log in (simulated with localStorage)
- Dashboard to create a room, join with a code, and see your rooms
- Product gallery with photos, category filters, and search
- Shared cart showing who added each item
- Duplicate-item warning when someone else already added the same product
- Quantity controls (+ / −) and a Remove button
- Live sync across browser tabs (localStorage + storage event)
- Activity log of every add, change, and remove
- Free-delivery progress bar
- Printable receipt with a per-person split, delivery status, and a copy-summary button
- Responsive layout (Bootstrap 5)

## Tech Used
HTML5, CSS3, Bootstrap 5, JavaScript, localStorage, sessionStorage

## How to Run Locally
1. Download or clone this repository.
2. Open `index.html` in a browser (or use VS Code Live Server).
3. Click Create Account, then create a room on the dashboard.
4. To test collaboration, open a second tab, create another account,
   and join the same room code.

## Assumptions
- There is no backend. Sync works between tabs of the same browser.
- Login is simulated with localStorage and is not secure.
- The free-delivery minimum is set to ₹500 (the brief gives $75 only as an example).
  It is defined as `FREE_DELIVERY_AT` in both `js/shop.js` and `js/receipt.js`;
  change it in both files.
- The product list is hard-coded in `js/shop.js`.

## Project Structure
- `index.html` (login), `dashboard.html`, `shop.html`, `receipt.html`
- `css/style.css`
- `js/app.js`, `js/dashboard.js`, `js/shop.js`, `js/receipt.js`
- `assets/` (product images)

## Author
Keerthana Selvakumar