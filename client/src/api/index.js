import client from './client';

// ─── Auth ───
export const getDemoUsers = () => client.get('/auth/demo-users');
export const demoLogin = (userId) => client.post('/auth/demo-login', { userId });

// ─── Brand Profiles ───
export const getBrandProfile = () => client.get('/brands/profile');
export const createBrandProfile = (data) => client.post('/brands/profile', data);
export const updateBrandProfile = (data) => client.put('/brands/profile', data);
export const autoImportBrand = (url) => client.post('/brands/auto-import', { url });

// ─── Creator Profiles ───
export const getCreatorProfile = () => client.get('/creators/profile');
export const createCreatorProfile = (data) => client.post('/creators/profile', data);
export const updateCreatorProfile = (data) => client.put('/creators/profile', data);
export const uploadPortfolio = (formData) =>
  client.post('/creators/portfolio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getPortfolio = () => client.get('/creators/portfolio');

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

// ─── Briefs (Creator) ───
export const getBriefs = () => client.get('/briefs');
export const acceptBrief = (matchId) => client.post(`/briefs/${matchId}/accept`);
export const declineBrief = (matchId) => client.post(`/briefs/${matchId}/decline`);

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
export const uploadImages = (formData) =>
  client.post('/uploads/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ─── Stats ───
export const getOperatorStats = () => client.get('/stats/operator');
export const getCreatorStats = () => client.get('/stats/creator');
