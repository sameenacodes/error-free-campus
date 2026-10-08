import api from './api'

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

export const complaintService = {
  create: (data) => api.post('/complaints', data),
  getMyComplaints: () => api.get('/complaints/my'),
  getDetail: (id) => api.get(`/complaints/${id}`),
  assign: (id, data) => api.put(`/complaints/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  resolve: (id, data) => api.post(`/complaints/${id}/resolution`, data),
  reopen: (id) => api.put(`/complaints/${id}/reopen`),
  escalate: (id, reason) => api.post(`/complaints/${id}/escalate`, { reason }),
}

export const studentService = {
  getDashboard: () => api.get('/student/dashboard'),
}

export const hodService = {
  getDashboard: () => api.get('/hod/dashboard'),
  getComplaints: (page = 0, size = 20) => api.get(`/hod/complaints?page=${page}&size=${size}`),
  getStaff: (serviceUnit) => api.get('/hod/staff', { params: { serviceUnit } }),
  getAnalytics: () => api.get('/hod/analytics'),
}

export const staffService = {
  getDashboard: () => api.get('/staff/dashboard'),
  getComplaints: (page = 0, size = 20) => api.get(`/staff/complaints?page=${page}&size=${size}`),
}

export const principalService = {
  getDashboard: () => api.get('/principal/dashboard'),
  getComplaints: (params = {}) => api.get('/principal/complaints', { params }),
  getAnalytics: () => api.get('/principal/analytics'),
  getEscalations: () => api.get('/principal/escalations'),
  resolveEscalation: (id) => api.put(`/principal/escalations/${id}/resolve`),
}

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (page = 0, size = 20) => api.get(`/admin/users?page=${page}&size=${size}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getComplaints: (params = {}) => api.get('/admin/complaints', { params }),
  getAuditLogs: (page = 0) => api.get(`/admin/audit-logs?page=${page}&size=50`),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export const aiService = {
  analyze: (title, description, complaintId = null) =>
    api.post('/ai/analyze', { title, description, complaintId }),
  getAdminSummary: () => api.post('/ai/admin-summary'),
}

export const publicService = {
  getDepartments: () => api.get('/public/departments'),
  getCategories: () => api.get('/public/categories'),
  getServiceUnits: () => api.get('/public/service-units'),
}

export const profileService = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
}
