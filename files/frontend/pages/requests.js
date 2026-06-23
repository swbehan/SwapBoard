import { requestsAPI } from "../js/api.js";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  formatDate,
  showToast,
  buildCategoryOptions,
  openModal,
  closeModal,
} from "../js/utils.js";

let currentCategory = "";
let cachedRequests = [];

async function loadRequests() {
  const grid = document.getElementById("requests-grid");
  const empty = document.getElementById("requests-empty");
  grid.innerHTML = `<div class="loading-spinner"></div>`;

  const params = {};
  if (currentCategory) params.category = currentCategory;

  cachedRequests = await requestsAPI.getAll(params);
  grid.innerHTML = "";

  if (!cachedRequests.length) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  cachedRequests.forEach((r) => {
    const card = document.createElement("article");
    card.className = "card card--request";
    card.innerHTML = `
      <div class="card__category">${CATEGORY_ICONS[r.category]} ${r.category}</div>
      <h3 class="card__title">${escHtml(r.title)}</h3>
      ${r.budget ? `<div class="card__badge card__badge--budget">Budget: $${r.budget}</div>` : ""}
      <p class="card__desc">${escHtml(r.description || "No additional details.")}</p>
      <div class="card__footer">
        <span class="card__contact">✉ ${escHtml(r.contact)}</span>
        <span class="card__time">${formatDate(r.createdAt)}</span>
      </div>
      <div class="card__actions">
        <button class="btn btn--sm btn--success" data-fulfill="${r._id}">Mark Fulfilled</button>
        <button class="btn btn--sm btn--outline" data-edit="${r._id}">Edit</button>
        <button class="btn btn--sm btn--danger" data-delete="${r._id}">Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid
    .querySelectorAll("[data-fulfill]")
    .forEach((btn) =>
      btn.addEventListener("click", () => fulfillRequest(btn.dataset.fulfill))
    );
  grid
    .querySelectorAll("[data-edit]")
    .forEach((btn) =>
      btn.addEventListener("click", () => openEditModal(btn.dataset.edit))
    );
  grid
    .querySelectorAll("[data-delete]")
    .forEach((btn) =>
      btn.addEventListener("click", () => deleteRequest(btn.dataset.delete))
    );
}

function requestFormHtml(r = {}) {
  return `
    <div class="form__group">
      <label>What do you need? *</label>
      <input name="title" required placeholder="e.g. Intro to Psych textbook, desk lamp…" value="${escHtml(r.title || "")}" />
    </div>
    <div class="form__row">
      <div class="form__group">
        <label>Category *</label>
        <select name="category" required>
          <option value="">Select…</option>
          ${buildCategoryOptions(r.category || "")}
        </select>
      </div>
      <div class="form__group">
        <label>Budget (optional)</label>
        <input name="budget" type="number" min="0" step="1" placeholder="$" value="${r.budget ?? ""}" />
      </div>
    </div>
    <div class="form__group">
      <label>Details</label>
      <textarea name="description" rows="3" placeholder="Edition, size, condition preference…">${escHtml(r.description || "")}</textarea>
    </div>
    <div class="form__group">
      <label>Contact *</label>
      <input name="contact" required placeholder="your@email.edu" value="${escHtml(r.contact || "")}" />
    </div>
  `;
}

function openCreateModal() {
  openModal(`
    <h2 class="modal__title">Post a Request</h2>
    <form id="request-form" class="form">
      ${requestFormHtml()}
      <button type="submit" class="btn btn--primary btn--full">Post Request</button>
    </form>
  `);

  document
    .getElementById("request-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      if (!data.budget) delete data.budget;
      try {
        await requestsAPI.create(data);
        closeModal();
        showToast("Request posted!");
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
}

async function openEditModal(id) {
  const r = cachedRequests.find((x) => x._id === id);
  if (!r) return;

  openModal(`
    <h2 class="modal__title">Edit Request</h2>
    <form id="edit-request-form" class="form">
      ${requestFormHtml(r)}
      <button type="submit" class="btn btn--primary btn--full">Save Changes</button>
    </form>
  `);

  document
    .getElementById("edit-request-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.target));
      if (!data.budget) data.budget = null;
      try {
        await requestsAPI.update(id, data);
        closeModal();
        showToast("Request updated!");
        loadRequests();
      } catch (err) {
        showToast(err.message, "error");
      }
    });
}

async function fulfillRequest(id) {
  if (!confirm("Mark this request as fulfilled?")) return;
  try {
    await requestsAPI.fulfill(id);
    showToast("Marked as fulfilled!");
    loadRequests();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteRequest(id) {
  if (!confirm("Delete this request?")) return;
  try {
    await requestsAPI.delete(id);
    showToast("Request deleted.");
    loadRequests();
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

document.addEventListener("DOMContentLoaded", () => {
  loadRequests();

  document
    .getElementById("btn-new-request")
    .addEventListener("click", openCreateModal);

  const catFilter = document.getElementById("filter-category");
  catFilter.addEventListener("change", () => {
    currentCategory = catFilter.value;
    loadRequests();
  });
});
