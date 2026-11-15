import api from './axios';

export const fetchProjects = async () => {
    const { data } = await api.get('/projects');
    return data.data;
};

export const fetchProject = async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data.data;
};

export const createProject = async (payload) => {
    const { data } = await api.post('/projects', payload);
    return data.data;
};

export const updateProject = async (id, payload) => {
    const { data } = await api.patch(`/projects/${id}`, payload);
    return data.data;
};

export const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
};