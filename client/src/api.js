import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
});

export const fetchNotes = () => apiClient.get('/notes');
export const createNote = (note) => apiClient.post('/notes', note);
export const updateNote = (id, note) => apiClient.put(`/notes/${id}`, note);
export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);