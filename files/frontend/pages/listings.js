import { listingsAPI } from "../js/api.js";
import {
  LISTING_TYPES,
  CATEGORY_ICONS,
  formatDate,
  formatPrice,
  showToast,
  buildCategoryOptions,
  openModal,
  closeModal,
} from "../js/utils.js";

const filters = { category: "", type: "", q: "" };

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function cardHtml(item) {
  return `
    <div class="card__badge card__badge--${item.type}">${formatPrice(item.price, item.type)}</div>
    <div class="card__category">${CATEGORY_ICONS[item.category]} ${item.category}</div>
    <h3 class="card__title">${escHtml(item.title)}</h3>
    <p class="card__desc">${escHtml(item.description || "No description provided.")}</p>
    <div class="card__footer">
      <span class="card__contact">&#9993; ${escHtml(item.contact)}</span>
      <span class="card__time">${formatDate(item.createdAt)}</span>
    </div>
    <div class="card__actions">
      <button class="btn btn--sm btn--outline" data-edit="${item._id}">Edit</button>
      <button class="btn btn--sm btn--danger" data-delete="${item._id}">Delete</button>
    </div>
  `;
}

// Load and render listings
async function loadListings() {
  const grid = document.getElementById("listings-grid");
  const empty = document.getElementById("listings-empty");
  grid.innerHTML = `<div class="loading-spinner"></div>`;

  try {
    const items = await listingsAPI.getAll(filters);
    grid.innerHTML = "";

    if (items.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    for (const item of items) {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = cardHtml(item);
      grid.appendChild(card);
    }

    grid
      .querySelectorAll("[data-edit]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          openEditModal(btn.dataset.edit, items)
        )
      );
    grid
      .querySelectorAll("[data-delete]")
      .forEach((btn) =>
        btn.addEventListener("click", () => removeListing(btn.dataset.delete))
      );
  } catch (err) {
    grid.innerHTML = "";
    showToast(err.message, "error");
  }
}

function formHtml(item = {}) {
  const hidePrice = item.type && item.type !== "sell";
  return `
    <div class="form__group">
      <label>Title *</label>
      <input name="title" required value="${escHtml(item.title || "")}" placeholder="e.g. Calculus textbook, desk lamp..." />
    </div>
    <div class="form__row">
      <div class="form__group">
        <label>Category *</label>
        <select name="category" required>
          <option value="">Select...</option>
          ${buildCategoryOptions(item.category || "")}
        </select>
      </div>
      <div class="form__group">
        <label>Type *</label>
        <select name="type" required>
          <option value="">Select...</option>
          ${LISTING_TYPES.map(
            (t) =>
              `<option value="${t.value}" ${t.value === item.type ? "selected" : ""}>${t.label}</option>`
          ).join("")}
        </select>
      </div>
    </div>
    <div class="form__group" data-price ${hidePrice ? "hidden" : ""}>
      <label>Price ($)</label>
      <input name="price" type="number" min="0" step="1" value="${item.price ?? ""}" placeholder="0" />
    </div>
    <div class="form__group">
      <label>Description</label>
      <textarea name="description" rows="3" placeholder="Condition, edition, any details...">${escHtml(item.description || "")}</textarea>
    </div>
    <div class="form__group">
      <label>Contact *</label>
      <input name="contact" required value="${escHtml(item.contact || "")}" placeholder="your@email.edu" />
    </div>
  `;
}

function wirePriceToggle(form) {
  const typeSelect = form.querySelector("[name=type]");
  const priceGroup = form.querySelector("[data-price]");
  typeSelect.addEventListener("change", () => {
    priceGroup.hidden = typeSelect.value !== "sell";
  });
}

// Create listing
function openCreateModal() {
  openModal(`
    <h2 class="modal__title">Post a Listing</h2>
    <form id="listing-form" class="form">
      ${formHtml()}
      <button type="submit" class="btn btn--primary btn--full">Post Listing</button>
    </form>
  `);

  const form = document.getElementById("listing-form");
  wirePriceToggle(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      await listingsAPI.create(data);
      closeModal();
      showToast("Listing posted!");
      loadListings();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// Edit listing
function openEditModal(id, items) {
  const item = items.find((x) => x._id === id);
  if (!item) return;

  openModal(`
    <h2 class="modal__title">Edit Listing</h2>
    <form id="listing-form" class="form">
      ${formHtml(item)}
      <button type="submit" class="btn btn--primary btn--full">Save Changes</button>
    </form>
  `);

  const form = document.getElementById("listing-form");
  wirePriceToggle(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    try {
      await listingsAPI.update(id, data);
      closeModal();
      showToast("Listing updated!");
      loadListings();
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

// Delete listing
async function removeListing(id) {
  if (!confirm("Delete this listing?")) return;
  try {
    await listingsAPI.delete(id);
    showToast("Listing deleted.");
    loadListings();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// Wire up the page
document.addEventListener("DOMContentLoaded", () => {
  loadListings();

  document
    .getElementById("btn-new-listing")
    .addEventListener("click", openCreateModal);

  document.getElementById("filter-category").addEventListener("change", (e) => {
    filters.category = e.target.value;
    loadListings();
  });

  document.getElementById("filter-type").addEventListener("change", (e) => {
    filters.type = e.target.value;
    loadListings();
  });

  let timer;
  document.getElementById("search-input").addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      filters.q = e.target.value.trim();
      loadListings();
    }, 350);
  });
});
