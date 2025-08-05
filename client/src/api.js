import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

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