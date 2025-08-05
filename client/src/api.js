import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Note APIs
export const fetchNotes = (status = 'current', search = '') => apiClient.get('/notes', { params: { status, search } });
export const createNote = (note) => apiClient.post('/notes', note);
export const updateNote = (id, note) => apiClient.put(`/notes/${id}`, note);
export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);
export const archiveNote = (id) => apiClient.post(`/notes/${id}/archive`);
export const unarchiveNote = (id) => apiClient.post(`/notes/${id}/unarchive`);

// Tag APIs
export const fetchTags = () => apiClient.get('/tags');
export const addTagToNote = (noteId, tagName) => apiClient.post(`/notes/${noteId}/tags`, { tagName });
export const removeTagFromNote = (noteId, tagId) => apiClient.delete(`/notes/${noteId}/tags/${tagId}`);