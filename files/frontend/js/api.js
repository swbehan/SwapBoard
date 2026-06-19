const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Listings
export const listingsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/listings${qs ? "?" + qs : ""}`);
  },
  getOne: (id) => request(`/listings/${id}`),
  create: (body) => request("/listings", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/listings/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id) => request(`/listings/${id}`, { method: "DELETE" }),
};

// Requests
export const requestsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/requests${qs ? "?" + qs : ""}`);
  },
  getOne: (id) => request(`/requests/${id}`),
  create: (body) => request("/requests", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => request(`/requests/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (id) => request(`/requests/${id}`, { method: "DELETE" }),
  fulfill: (id) => request(`/requests/${id}`, { method: "PATCH", body: JSON.stringify({ fulfilled: true }) }),
};
