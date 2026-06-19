# SwapBoard

A campus marketplace for college students to buy, sell, swap, and request everyday items — textbooks, furniture, clothes, electronics, and more.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML, CSS
- **Backend**: Node.js + Express (ESM)
- **Database**: MongoDB (native driver)
- **Data**: Fetch API

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017`
  - Install: https://www.mongodb.com/docs/manual/installation/
  - Or use MongoDB Atlas (set `MONGO_URI` env var)

### Install dependencies
```bash
cd swapboard
npm install
```

### Seed the database
```bash
npm run seed
```
This loads 14 sample listings and 10 sample requests across all categories.

### Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Project Structure

```
swapboard/
├── backend/
│   ├── db/
│   │   └── connection.js      # MongoDB connection
│   ├── routes/
│   │   ├── listings.js        # CRUD + filter for listings
│   │   └── requests.js        # CRUD + fulfill for requests
│   ├── server.js              # Express app entry point
│   └── seed.js                # Database seed script
├── frontend/
│   ├── index.html             # Listings page
│   ├── requests.html          # Requests page
│   ├── js/
│   │   ├── api.js             # Fetch API client (listings + requests)
│   │   └── utils.js           # Shared helpers, modal, toast
│   ├── pages/
│   │   ├── listings.js        # Listings page logic
│   │   └── requests.js        # Requests page logic
│   └── styles/
│       └── main.css           # All styles
└── package.json
```

---

## API Reference

### Listings — `/api/listings`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/listings` | Get all listings. Query: `?category=`, `?type=`, `?q=` (text search) |
| GET | `/api/listings/:id` | Get one listing |
| POST | `/api/listings` | Create a listing |
| PATCH | `/api/listings/:id` | Edit a listing |
| DELETE | `/api/listings/:id` | Delete a listing |

**Listing fields**: `title` (required), `category` (required), `type` (required: `sell`/`swap`/`free`), `price` (required if sell), `description`, `contact` (required)

**Categories**: `Academic`, `Furniture`, `Clothing`, `Electronics`, `Other`

---

### Requests — `/api/requests`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/requests` | Get open requests. Query: `?category=`, `?showFulfilled=true` |
| GET | `/api/requests/:id` | Get one request |
| POST | `/api/requests` | Create a request |
| PATCH | `/api/requests/:id` | Edit a request (or set `fulfilled: true`) |
| DELETE | `/api/requests/:id` | Delete a request |

**Request fields**: `title` (required), `category` (required), `budget` (optional), `description`, `contact` (required), `fulfilled` (boolean)

---

## Technical Independence

The `listings` and `requests` collections are fully independent:
- Each defines its own copy of the `CATEGORIES` constant
- Each has its own router, validation, and data shape
- Neither imports from the other
