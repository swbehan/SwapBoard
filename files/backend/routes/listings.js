import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();
const COLLECTION = "listings";

const VALID_CATEGORIES = ["Academic", "Furniture", "Clothing", "Electronics", "Other"];
const VALID_TYPES = ["sell", "swap", "free"];

// GET /api/listings — list all, with optional ?category= and ?type= and ?q= filters
router.get("/", async (req, res) => {
  try {
    const { category, type, q } = req.query;
    const filter = {};
    if (category && VALID_CATEGORIES.includes(category)) filter.category = category;
    if (type && VALID_TYPES.includes(type)) filter.type = type;
    if (q) filter.$text = { $search: q };

    const listings = await getDB()
      .collection(COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/listings/:id
router.get("/:id", async (req, res) => {
  try {
    const listing = await getDB()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/listings
router.post("/", async (req, res) => {
  try {
    const { title, description, category, type, price, contact } = req.body;
    if (!title || !category || !type || !contact) {
      return res.status(400).json({ error: "title, category, type, and contact are required" });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` });
    }
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    const doc = {
      title: title.trim(),
      description: description?.trim() || "",
      category,
      type,
      price: type === "sell" ? (parseFloat(price) || 0) : null,
      contact: contact.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
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
    if (category) {
      if (!VALID_CATEGORIES.includes(category))
        return res.status(400).json({ error: `Invalid category` });
      updates.category = category;
    }
    if (type) {
      if (!VALID_TYPES.includes(type))
        return res.status(400).json({ error: `Invalid type` });
      updates.type = type;
    }
    if (price !== undefined) updates.price = parseFloat(price) || 0;
    if (contact) updates.contact = contact.trim();

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
    if (result.deletedCount === 0) return res.status(404).json({ error: "Listing not found" });
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
