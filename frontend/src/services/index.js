import api from './api';

const d = (p) => p.then((r) => r.data);

export const authApi = {
  register: (b) => d(api.post('/auth/register', b)),
  login: (b) => d(api.post('/auth/login', b)),
  logout: () => d(api.post('/auth/logout')),
  me: () => d(api.get('/auth/me')),
  forgotPassword: (b) => d(api.post('/auth/forgot-password', b)),
  resetPassword: (b) => d(api.post('/auth/reset-password', b)),
};

export const usersApi = {
  profile: () => d(api.get('/users/profile')),
  updateProfile: (b) => d(api.put('/users/profile', b)),
  changePassword: (b) => d(api.put('/users/change-password', b)),
  deleteAccount: (b) => d(api.delete('/users/account', { data: b })),
};

export const dashboardApi = {
  summary: () => d(api.get('/dashboard/summary')),
  weightProgress: () => d(api.get('/dashboard/weight-progress')),
  nutritionSummary: () => d(api.get('/dashboard/nutrition-summary')),
  workoutSummary: () => d(api.get('/dashboard/workout-summary')),
  strengthProgress: () => d(api.get('/dashboard/strength-progress')),
};


export const foodsApi = {
  list: (params) => d(api.get('/nutrition/foods', { params })),
  search: (q) => d(api.get('/nutrition/foods', { params: { q } })),
  get: (id) => d(api.get(`/nutrition/foods/${id}`)),
  create: (b) => d(api.post('/nutrition/foods', b)),
  update: (id, b) => d(api.put(`/nutrition/foods/${id}`, b)),
  remove: (id) => d(api.delete(`/nutrition/foods/${id}`)),
};

export const foodLogsApi = {
  list: (params) => d(api.get('/nutrition/logs', {
    params: { log_date: params?.date }
  })),
  create: (b) => d(api.post('/nutrition/logs', b)),
  update: (id, b) => d(api.put(`/nutrition/logs/${id}`, b)),
  remove: (id) => d(api.delete(`/nutrition/logs/${id}`)),
  daily: (date) => d(api.get('/nutrition/summary', {
    params: { log_date: date }
  })),
  weekly: (end_date) => d(api.get('/nutrition/summary', {
    params: { log_date: end_date }
  })),
};


export const weightApi = {
  list: () => d(api.get('/weight')),
  get: (id) => d(api.get(`/weight/${id}`)),
  create: (b) => d(api.post('/weight', b)),
  update: (id, b) => d(api.put(`/weight/${id}`, b)),
  remove: (id) => d(api.delete(`/weight/${id}`)),
  progress: () => d(api.get('/weight/progress')),
};

export const measurementsApi = {
  list: () => d(api.get('/measurements')),
  create: (b) => d(api.post('/measurements', b)),
  update: (id, b) => d(api.put(`/measurements/${id}`, b)),
  remove: (id) => d(api.delete(`/measurements/${id}`)),
};

export const workoutsApi = {
  list: (params) => d(api.get('/workouts', { params })),
  get: (id) => d(api.get(`/workouts/${id}`)),
  create: (b) => d(api.post('/workouts', b)),
  update: (id, b) => d(api.put(`/workouts/${id}`, b)),
  remove: (id) => d(api.delete(`/workouts/${id}`)),
  finish: (id) => d(api.post(`/workouts/${id}/finish`)),
};

export const exercisesApi = {
  list: (params) => d(api.get('/exercises', { params })),
  create: (b) => d(api.post('/exercises', b)),
  update: (id, b) => d(api.put(`/exercises/${id}`, b)),
  remove: (id) => d(api.delete(`/exercises/${id}`)),
};

export const workoutLogsApi = {
  list: (params) => d(api.get('/workout-logs', { params })),
  get: (id) => d(api.get(`/workout-logs/${id}`)),
  create: (b) => d(api.post('/workout-logs', b)),
  update: (id, b) => d(api.put(`/workout-logs/${id}`, b)),
  remove: (id) => d(api.delete(`/workout-logs/${id}`)),
};

export const progressionApi = {
  get: (id) => d(api.get(`/progression/${id}`)),
  history: (id) => d(api.get(`/progression/${id}/history`)),
  compare: (id) => d(api.get(`/progression/${id}/compare`)),
  personalRecords: () => d(api.get('/progression/personal-records')),
  volumeHistory: () => d(api.get('/progression/volume-history')),
};

export const goalsApi = {
  list: () => d(api.get('/goals')),
  create: (b) => d(api.post('/goals', b)),
  update: (id, b) => d(api.put(`/goals/${id}`, b)),
  remove: (id) => d(api.delete(`/goals/${id}`)),
};

export const photosApi = {
  list: () => d(api.get('/progress-photos')),
  upload: (formData) => d(api.post('/progress-photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } })),
  remove: (id) => d(api.delete(`/progress-photos/${id}`)),
  /** Photos are private: the image is fetched with the JWT and shown via an object URL. */
  file: (id) => api.get(`/progress-photos/${id}/file`, { responseType: 'blob' }).then((r) => r.data),
};

export const analyticsApi = {
  weekly: () => d(api.get('/analytics/weekly')),
  monthly: () => d(api.get('/analytics/monthly')),
  weight: (params) => d(api.get('/analytics/weight', { params })),
  nutrition: (params) => d(api.get('/analytics/nutrition', { params })),
  workouts: (params) => d(api.get('/analytics/workouts', { params })),
  strength: (params) => d(api.get('/analytics/strength', { params })),
};
