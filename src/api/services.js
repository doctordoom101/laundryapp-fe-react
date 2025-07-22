import api from "./axios"

// Auth Services
export const authService = {
  login: (credentials) => api.post("/login", credentials),
  logout: () => api.post("/logout"),
  getProfile: () => api.get("/me"),
}

// User Services
export const userService = {
  getUsers: (params = {}) => api.get("/users", { params }),
  createUser: (data) => api.post("/users", data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUser: (id) => api.get(`/users/${id}`),
}

// Outlet Services
export const outletService = {
  getOutlets: (params = {}) => api.get("/outlets", { params }),
  createOutlet: (data) => api.post("/outlets", data),
  updateOutlet: (id, data) => api.put(`/outlets/${id}`, data),
  deleteOutlet: (id) => api.delete(`/outlets/${id}`),
  getOutlet: (id) => api.get(`/outlets/${id}`),
}

// Product Services
export const productService = {
  getProducts: (params = {}) => api.get("/products", { params }),
  createProduct: (data) => api.post("/products", data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getProduct: (id) => api.get(`/products/${id}`),
}

// Laundry Item Services
export const laundryService = {
  getLaundryItems: (params = {}) => api.get("/laundry-items", { params }),
  createLaundryItem: (data) => api.post("/laundry-items", data),
  updateLaundryItemStatus: (id, status) => api.patch(`/laundry-items/${id}/status`, { process_status: status }),
  getLaundryItem: (id) => api.get(`/laundry-items/${id}`),
  checkStatus: (code) => api.get(`/laundry-items/check/${code}`),
}

// Transaction Services
export const transactionService = {
  getTransactions: (params = {}) => api.get("/transactions", { params }),
  createTransaction: (data) => api.post("/transactions", data),
}

// Report Services
export const reportService = {
  getReports: (params = {}) => api.get("/reports", { params }),
}
