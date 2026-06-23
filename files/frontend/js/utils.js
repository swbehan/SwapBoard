export const CATEGORIES = [
  "Academic",
  "Furniture",
  "Clothing",
  "Electronics",
  "Other",
];

export const LISTING_TYPES = [
  { value: "sell", label: "For Sale" },
  { value: "swap", label: "Swap" },
  { value: "free", label: "Free" },
];

export const CATEGORY_ICONS = {
  Academic: "📚",
  Furniture: "🪑",
  Clothing: "👕",
  Electronics: "💻",
  Other: "📦",
};

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatPrice(price, type) {
  if (type === "free") return "Free";
  if (type === "swap") return "Swap";
  if (price == null || price === 0) return "Free";
  return `$${parseFloat(price).toFixed(0)}`;
}

export function showToast(message, type = "success") {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("toast--visible"));
  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function buildCategoryOptions(selected = "") {
  return CATEGORIES.map(
    (c) =>
      `<option value="${c}" ${c === selected ? "selected" : ""}>${CATEGORY_ICONS[c]} ${c}</option>`
  ).join("");
}

export function openModal(html) {
  let overlay = document.getElementById("modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modal-overlay";
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `<div class="modal">${html}<button class="modal__close" aria-label="Close">✕</button></div>`;
  overlay.classList.add("modal-overlay--visible");
  overlay.querySelector(".modal__close").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.body.style.overflow = "hidden";
}

export function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (overlay) {
    overlay.classList.remove("modal-overlay--visible");
    document.body.style.overflow = "";
  }
}
