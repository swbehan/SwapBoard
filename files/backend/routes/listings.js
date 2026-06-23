import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();
const COLLECTION = "listings";

const CATEGORIES = [
  "Academic",
  "Furniture",
  "Clothing",
  "Electronics",
  "Other",
];
const TYPES = ["sell", "swap", "free"];

function priceFor(type, price) {
  if (type !== "sell") return null;
  const n = Number(price);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

// GET /api/listings  (optional ?category= ?type= ?q=)
router.get("/", async (req, res) => {
  try {
    const { category, type, q } = req.query;
    const query = {};
    if (category && CATEGORIES.includes(category)) query.category = category;
    if (type && TYPES.includes(type)) query.type = type;
    if (q) query.$text = { $search: q };

    const items = await getDB()
      .collection(COLLECTION)
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const item = await getDB()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!item) return res.status(404).json({ error: "Listing not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings
router.post("/", async (req, res) => {
  try {
    const { title, description, category, type, price, contact } = req.body;

    if (!title || !category || !type || !contact) {
      return res
        .status(400)
        .json({ error: "title, category, type, and contact are required" });
    }
    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }
    if (!TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const now = new Date();
    const doc = {
      title: title.trim(),
      description: (description || "").trim(),
      category,
      type,
      price: priceFor(type, price),
      contact: contact.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await getDB().collection(COLLECTION).insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/listings/:id
router.patch("/:id", async (req, res) => {
  try {
    const { title, description, category, type, price, contact } = req.body;
    const updates = { updatedAt: new Date() };

    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (contact) updates.contact = contact.trim();
    if (category) {
      if (!CATEGORIES.includes(category))
        return res.status(400).json({ error: "Invalid category" });
      updates.category = category;
    }
    if (type) {
      if (!TYPES.includes(type))
        return res.status(400).json({ error: "Invalid type" });
      updates.type = type;
    }
    if (type || price !== undefined) {
      updates.price = priceFor(updates.type || type, price);
    }

    const result = await getDB()
      .collection(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) return res.status(404).json({ error: "Listing not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/listings/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
