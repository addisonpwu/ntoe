import axios from 'axios';

// The proxy in package.json handles directing this to the backend.
const apiClient = axios.create({
  baseURL: '/api',
});

export default apiClient;

// Auth APIs
export const login = (username, password) => apiClient.post('/auth/login', { username, password });

// Note APIs
export const fetchNotes = (status = 'current', search = '', tagId = null, folderId = 'inbox') => {
  const params = { status, search, folderId };
  if (tagId) {
    params.tagId = tagId;
  }
  return apiClient.get('/notes', { params });
};
export const createNote = (note) => apiClient.post('/notes', note);
export const updateNote = (id, note) => apiClient.put(`/notes/${id}`, note);
export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);
export const archiveNote = (id) => apiClient.post(`/notes/${id}/archive`);
export const unarchiveNote = (id) => apiClient.post(`/notes/${id}/unarchive`);
export const moveNote = (id, folderId) => apiClient.put(`/notes/${id}/move`, { folderId });

// Tag APIs
export const fetchTags = () => apiClient.get('/tags');
export const addTagToNote = (noteId, tagName) => apiClient.post(`/notes/${noteId}/tags`, { tagName });
export const removeTagFromNote = (noteId, tagId) => apiClient.delete(`/notes/${noteId}/tags/${tagId}`);

// Folder APIs
export const fetchFolders = () => apiClient.get('/folders');
export const createFolder = (name) => apiClient.post('/folders', { name });
export const renameFolder = (id, name) => apiClient.put(`/folders/${id}`, { name });
export const deleteFolder = (id) => apiClient.delete(`/folders/${id}`);

// Admin APIs
export const fetchAdminStats = () => apiClient.get('/admin/stats');
export const fetchAllNotes = () => apiClient.get('/admin/notes');
export const fetchUsers = () => apiClient.get('/admin/users');
export const createUser = (userData) => apiClient.post('/admin/users', userData);
export const deleteUser = (userId) => apiClient.delete(`/admin/users/${userId}`);
