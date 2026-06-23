import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/connection.js";

const router = Router();
const COLLECTION = "requests";

const VALID_CATEGORIES = [
  "Academic",
  "Furniture",
  "Clothing",
  "Electronics",
  "Other",
];

// GET /api/requests — list all open requests, with optional ?category= filter
router.get("/", async (req, res) => {
  try {
    const { category, showFulfilled } = req.query;
    const filter = {};
    if (category && VALID_CATEGORIES.includes(category))
      filter.category = category;
    if (showFulfilled !== "true") filter.fulfilled = false;

    const requests = await getDB()
      .collection(COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/:id
router.get("/:id", async (req, res) => {
  try {
    const request = await getDB()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/requests
router.post("/", async (req, res) => {
  try {
    const { title, description, category, budget, contact } = req.body;
    if (!title || !category || !contact) {
      return res
        .status(400)
        .json({ error: "title, category, and contact are required" });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res
        .status(400)
        .json({
          error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`,
        });
    }

    const doc = {
      title: title.trim(),
      description: description?.trim() || "",
      category,
      budget: budget ? parseFloat(budget) : null,
      contact: contact.trim(),
      fulfilled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await getDB().collection(COLLECTION).insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id — edit fields or mark fulfilled
router.patch("/:id", async (req, res) => {
  try {
    const { title, description, category, budget, contact, fulfilled } =
      req.body;
    const updates = { updatedAt: new Date() };

    if (title) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (category) {
      if (!VALID_CATEGORIES.includes(category))
        return res.status(400).json({ error: "Invalid category" });
      updates.category = category;
    }
    if (budget !== undefined)
      updates.budget = budget ? parseFloat(budget) : null;
    if (contact) updates.contact = contact.trim();
    if (fulfilled !== undefined) updates.fulfilled = Boolean(fulfilled);

    const result = await getDB()
      .collection(COLLECTION)
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updates },
        { returnDocument: "after" }
      );

    if (!result) return res.status(404).json({ error: "Request not found" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/requests/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
