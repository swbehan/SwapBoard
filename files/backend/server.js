import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/connection.js";
import listingsRouter from "./routes/listings.js";
import requestsRouter from "./routes/requests.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(join(__dirname, "../frontend")));

// API routes
app.use("/api/listings", listingsRouter);
app.use("/api/requests", requestsRouter);

await connectDB();
app.listen(PORT, () => {
  console.log(`SwapBoard running at http://localhost:${PORT}`);
});
