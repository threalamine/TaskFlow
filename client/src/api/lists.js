import api from './axios';

export const fetchLists = async (projectId) => {
    const { data } = await api.get(`/projects/${projectId}/lists`);
    return data.data;
};

export const createList = async (projectId, payload) => {
    const { data } = await api.post(`/projects/${projectId}/lists`, payload);
    return data.data;
};

export const updateList = async (projectId, listId, payload) => {
    const { data } = await api.patch(
        `/projects/${projectId}/lists/${listId}`,
        payload
    );
    return data.data;
};

export const deleteList = async (projectId, listId) => {
    await api.delete(`/projects/${projectId}/lists/${listId}`);
};