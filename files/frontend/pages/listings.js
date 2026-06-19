import { listingsAPI } from "../js/api.js";
import {
  CATEGORIES, LISTING_TYPES, CATEGORY_ICONS,
  formatDate, formatPrice, showToast,
  buildCategoryOptions, openModal, closeModal,
} from "../js/utils.js";

let currentFilters = { category: "", type: "", q: "" };

async function loadListings() {
  const grid = document.getElementById("listings-grid");
  const empty = document.getElementById("listings-empty");
  grid.innerHTML = `<div class="loading-spinner"></div>`;

  const params = {};
  if (currentFilters.category) params.category = currentFilters.category;
  if (currentFilters.type) params.type = currentFilters.type;
  if (currentFilters.q) params.q = currentFilters.q;

  const listings = await listingsAPI.getAll(params);
  grid.innerHTML = "";

  if (!listings.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  listings.forEach((l) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__badge card__badge--${l.type}">${formatPrice(l.price, l.type)}</div>
      <div class="card__category">${CATEGORY_ICONS[l.category]} ${l.category}</div>
      <h3 class="card__title">${escHtml(l.title)}</h3>
      <p class="card__desc">${escHtml(l.description || "No description provided.")}</p>
      <div class="card__footer">
        <span class="card__contact">✉ ${escHtml(l.contact)}</span>
        <span class="card__time">${formatDate(l.createdAt)}</span>
      </div>
      <div class="card__actions">
        <button class="btn btn--sm btn--outline" data-edit="${l._id}">Edit</button>
        <button class="btn btn--sm btn--danger" data-delete="${l._id}">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("[data-edit]").forEach((btn) =>
    btn.addEventListener("click", () => openEditModal(btn.dataset.edit, listings))
  );
  grid.querySelectorAll("[data-delete]").forEach((btn) =>
    btn.addEventListener("click", () => deleteListing(btn.dataset.delete))
  );
}

function openCreateModal() {
  openModal(`
    <h2 class="modal__title">Post a Listing</h2>
    <form id="listing-form" class="form">
      <div class="form__group">
        <label>Title *</label>
        <input name="title" required placeholder="e.g. Calculus textbook, IKEA desk…" />
      </div>
      <div class="form__row">
        <div class="form__group">
          <label>Category *</label>
          <select name="category" required>
            <option value="">Select…</option>
            ${buildCategoryOptions()}
          </select>
        </div>
        <div class="form__group">
          <label>Type *</label>
          <select name="type" required>
            <option value="">Select…</option>
            ${LISTING_TYPES.map((t) => `<option value="${t.value}">${t.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form__group" id="price-group" hidden>
        <label>Price ($)</label>
        <input name="price" type="number" min="0" step="1" placeholder="0" />
      </div>
      <div class="form__group">
        <label>Description</label>
        <textarea name="description" rows="3" placeholder="Condition, edition, any relevant details…"></textarea>
      </div>
      <div class="form__group">
        <label>Contact *</label>
        <input name="contact" required placeholder="your@email.edu" />
      </div>
      <button type="submit" class="btn btn--primary btn--full">Post Listing</button>
    </form>
  `);

  const form = document.getElementById("listing-form");
  const typeSelect = form.querySelector("[name=type]");
  const priceGroup = document.getElementById("price-group");

  typeSelect.addEventListener("change", () => {
    priceGroup.hidden = typeSelect.value !== "sell";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (data.type !== "sell") delete data.price;
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

async function openEditModal(id, listings) {
  const l = listings.find((x) => x._id === id);
  if (!l) return;

  openModal(`
    <h2 class="modal__title">Edit Listing</h2>
    <form id="edit-form" class="form">
      <div class="form__group">
        <label>Title *</label>
        <input name="title" required value="${escHtml(l.title)}" />
      </div>
      <div class="form__row">
        <div class="form__group">
          <label>Category *</label>
          <select name="category" required>${buildCategoryOptions(l.category)}</select>
        </div>
        <div class="form__group">
          <label>Type *</label>
          <select name="type" required>
            ${LISTING_TYPES.map((t) => `<option value="${t.value}" ${t.value === l.type ? "selected" : ""}>${t.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form__group" id="price-group-edit" ${l.type !== "sell" ? "hidden" : ""}>
        <label>Price ($)</label>
        <input name="price" type="number" min="0" step="1" value="${l.price ?? ""}" />
      </div>
      <div class="form__group">
        <label>Description</label>
        <textarea name="description" rows="3">${escHtml(l.description || "")}</textarea>
      </div>
      <div class="form__group">
        <label>Contact *</label>
        <input name="contact" required value="${escHtml(l.contact)}" />
      </div>
      <button type="submit" class="btn btn--primary btn--full">Save Changes</button>
    </form>
  `);

  const form = document.getElementById("edit-form");
  const typeSelect = form.querySelector("[name=type]");
  const priceGroup = document.getElementById("price-group-edit");
  typeSelect.addEventListener("change", () => {
    priceGroup.hidden = typeSelect.value !== "sell";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    if (data.type !== "sell") data.price = null;
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

async function deleteListing(id) {
  if (!confirm("Delete this listing?")) return;
  try {
    await listingsAPI.delete(id);
    showToast("Listing deleted.");
    loadListings();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadListings();

  document.getElementById("btn-new-listing").addEventListener("click", openCreateModal);

  // Filters
  const catFilter = document.getElementById("filter-category");
  const typeFilter = document.getElementById("filter-type");
  const searchInput = document.getElementById("search-input");

  catFilter.addEventListener("change", () => {
    currentFilters.category = catFilter.value;
    loadListings();
  });
  typeFilter.addEventListener("change", () => {
    currentFilters.type = typeFilter.value;
    loadListings();
  });

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentFilters.q = searchInput.value.trim();
      loadListings();
    }, 400);
  });
});
