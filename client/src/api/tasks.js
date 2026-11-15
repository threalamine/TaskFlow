import api from './axios';

export const fetchTasks = async (projectId) => {
    const tasks = [];
    let page = 1;
    let pages = 1;

    do {
        const { data } = await api.get(`/projects/${projectId}/tasks`, {
            params: { limit: 100, page },
        });

        tasks.push(...data.data);
        pages = data.pages;
        page += 1;
    } while (page <= pages);

    return tasks;
};

export const createTask = async (projectId, payload) => {
    const { data } = await api.post(`/projects/${projectId}/tasks`, payload);
    return data.data;
};

export const updateTask = async (projectId, taskId, payload) => {
    const { data } = await api.patch(
        `/projects/${projectId}/tasks/${taskId}`,
        payload
    );
    return data.data;
};

export const deleteTask = async (projectId, taskId) => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
};