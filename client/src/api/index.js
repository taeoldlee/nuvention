import client from './client';

// ─── Auth ───
export const getDemoUsers = () => client.get('/auth/demo-users');
export const demoLogin = (userId) => client.post('/auth/demo-login', { userId });

// ─── Brand Profiles ───
export const getBrandProfile = () => client.get('/brands/profile');
export const createBrandProfile = (data) => client.post('/brands/profile', data);
export const updateBrandProfile = (data) => client.put('/brands/profile', data);
export const autoImportBrand = (url) => client.post('/brands/auto-import', { url });
export const analyzeBrandFromPlace = (placeData) => client.post('/brands/analyze-place', placeData);

// ─── Briefs (Brand) ───
export const createBrief = (data) => client.post('/briefs', data);
export const getBriefs = (status) => client.get('/briefs', { params: status ? { status } : {} });
export const getBrief = (id) => client.get(`/briefs/${id}`);
export const updateBrief = (id, data) => client.put(`/briefs/${id}`, data);
export const closeBrief = (id) => client.post(`/briefs/${id}/close`);
export const deleteBrief = (id) => client.delete(`/briefs/${id}`);
export const getBriefApplications = (briefId) => client.get(`/briefs/${briefId}/applications`);

// ─── Public Portal ───
export const getPortalBriefs = () => client.get('/portal/briefs');
export const getPortalBrief = (id) => client.get(`/portal/briefs/${id}`);
export const submitApplication = (briefId, data) => client.post(`/portal/briefs/${briefId}/apply`, data);

// ─── Application Status (public) ───
export const getApplicationStatus = (token) => client.get(`/portal/applications/${token}`);

// ─── Applications ───
export const getApplication = (id) => client.get(`/applications/${id}`);
export const getApplicationProfile = (id) => client.get(`/applications/${id}/profile`);
export const selectApplication = (id) => client.post(`/applications/${id}/select`);
export const rejectApplication = (id) => client.post(`/applications/${id}/reject`);

// ─── Projects ───
export const getProjects = () => client.get('/projects');
export const getProject = (id) => client.get(`/projects/${id}`);
export const completeProject = (projectId) => client.post(`/projects/${projectId}/complete`);
export const downloadUsageRightsPDF = (projectId) =>
  client.get(`/projects/${projectId}/usage-rights-pdf`, { responseType: 'blob' });

// ─── Creator Portal (token-based) ───
const creatorClient = (token) => ({
  accept: (projectId) => client.post(`/projects/${projectId}/accept`, {}, { headers: { 'x-creator-token': token } }),
  decline: (projectId) => client.post(`/projects/${projectId}/decline`, {}, { headers: { 'x-creator-token': token } }),
  getProject: (projectId) => client.get(`/projects/${projectId}/creator`, { headers: { 'x-creator-token': token } }),
  submitDraft: (projectId, data) => client.post(`/projects/${projectId}/drafts`, data, { headers: { 'x-creator-token': token } }),
  getMessages: (projectId) => client.get(`/projects/${projectId}/messages`, { headers: { 'x-creator-token': token } }),
  sendMessage: (projectId, text) => client.post(`/projects/${projectId}/messages`, { text }, { headers: { 'x-creator-token': token } }),
});
export { creatorClient };

// ─── Brand Draft Review ───
export const approveDraft = (projectId, draftId, feedback) =>
  client.post(`/projects/${projectId}/drafts/${draftId}/approve`, { feedback });
export const requestRevision = (projectId, draftId, feedback) =>
  client.post(`/projects/${projectId}/drafts/${draftId}/revision`, { feedback });

// ─── Messages (Brand) ───
export const getProjectMessages = (projectId) => client.get(`/projects/${projectId}/messages`);
export const sendProjectMessage = (projectId, text) =>
  client.post(`/projects/${projectId}/messages`, { text });

// ─── Notifications ───
export const getNotifications = () => client.get('/notifications');
export const getUnreadCount = () => client.get('/notifications/unread-count');
export const markNotificationRead = (id) => client.post(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.post('/notifications/read-all');

// ─── AI ───
export const getBriefSuggestions = (data) => client.post('/ai/suggest-brief', data);
export const rankApplications = (briefId) => client.post('/ai/rank-applications', { briefId });

// ─── Uploads ───
export const uploadImage = (formData) =>
  client.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const uploadImages = (formData, { onUploadProgress } = {}) =>
  client.post('/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

// ─── Stats ───
export const getBrandStats = () => client.get('/stats/brand');

// ─── Transactions ───
export const getTransactions = () => client.get('/transactions');
export const getTransaction = (id) => client.get(`/transactions/${id}`);

// ─── Agency ───
export const getAgencyProfile = () => client.get('/agencies/profile');
export const createAgencyProfile = (data) => client.post('/agencies/profile', data);
export const updateAgencyProfile = (data) => client.put('/agencies/profile', data);
export const getAgencyRoster = () => client.get('/agencies/roster');
export const addRosterCreator = (data) => client.post('/agencies/roster', data);
export const updateRosterCreator = (id, data) => client.put(`/agencies/roster/${id}`, data);
export const deleteRosterCreator = (id) => client.delete(`/agencies/roster/${id}`);
export const getAgencyBriefs = () => client.get('/agencies/briefs');
export const getAgencyBrief = (id) => client.get(`/agencies/briefs/${id}`);
export const agencyApply = (briefId, data) => client.post(`/agencies/briefs/${briefId}/apply`, data);
export const getAgencyApplications = () => client.get('/agencies/applications');
export const getAgencyStats = () => client.get('/agencies/stats');

// ─── Admin ───
export const reseedDatabase = () => client.post('/admin/reseed');

// ─── Insights ───
export const getInsights = () => client.get('/stats/insights');

// ─── Alias (used by SuggestionPanel) ───
export const getRequestSuggestions = getBriefSuggestions;
