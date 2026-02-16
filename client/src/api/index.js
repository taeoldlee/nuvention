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

// ─── Creator Profiles ───
export const getCreatorProfile = () => client.get('/creators/profile');
export const createCreatorProfile = (data) => client.post('/creators/profile', data);
export const updateCreatorProfile = (data) => client.put('/creators/profile', data);
export const uploadPortfolio = (formData, { onUploadProgress } = {}) =>
  client.post('/creators/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
export const getPortfolio = () => client.get('/creators/portfolio');
export const deletePortfolioItem = (id) => client.delete(`/creators/portfolio/${id}`);
export const importCreatorSocial = (data) => client.post('/creators/import-social', data);

// ─── Content Requests + Matching ───
export const createContentRequest = (data) => client.post('/requests', data);
export const getContentRequests = () => client.get('/requests');
export const getContentRequest = (id) => client.get(`/requests/${id}`);
export const selectMatch = (requestId, matchId) =>
  client.post(`/requests/${requestId}/select/${matchId}`);

// ─── Projects ───
export const getProjects = () => client.get('/projects');
export const getProject = (id) => client.get(`/projects/${id}`);
export const submitDraft = (projectId, data) =>
  client.post(`/projects/${projectId}/drafts`, data);
export const approveDraft = (projectId, draftId) =>
  client.post(`/projects/${projectId}/drafts/${draftId}/approve`);
export const requestRevision = (projectId, draftId, feedback) =>
  client.post(`/projects/${projectId}/drafts/${draftId}/revision`, { feedback });
export const deliverProject = (projectId) =>
  client.post(`/projects/${projectId}/deliver`);
export const downloadUsageRightsPDF = (projectId) =>
  client.get(`/projects/${projectId}/usage-rights-pdf`, { responseType: 'blob' });

// ─── Messages ───
export const getProjectMessages = (projectId) => client.get(`/projects/${projectId}/messages`);
export const sendProjectMessage = (projectId, text) =>
  client.post(`/projects/${projectId}/messages`, { text });

// ─── Briefs (Creator) ───
export const getBriefs = () => client.get('/briefs');
export const markBriefViewed = (matchId) => client.post(`/briefs/${matchId}/view`);
export const acceptBrief = (matchId) => client.post(`/briefs/${matchId}/accept`);
export const declineBrief = (matchId) => client.post(`/briefs/${matchId}/decline`);
export const askBriefQuestion = (matchId, text) =>
  client.post(`/briefs/${matchId}/question`, { text });

// ─── Notifications ───
export const getNotifications = () => client.get('/notifications');
export const getUnreadCount = () => client.get('/notifications/unread-count');
export const markNotificationRead = (id) => client.post(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => client.post('/notifications/read-all');

// ─── AI ───
export const analyzeBrand = (data) => client.post('/ai/analyze-brand', data);
export const analyzePortfolio = (imageUrls) =>
  client.post('/ai/analyze-portfolio', { imageUrls });
export const getRequestSuggestions = () => client.post('/ai/suggest-request');

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
export const getOperatorStats = () => client.get('/stats/operator');
export const getCreatorStats = () => client.get('/stats/creator');

// ─── Admin ───
export const reseedDatabase = () => client.post('/admin/reseed');
