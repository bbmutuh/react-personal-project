// Instruments
import { MAIN_URL, TOKEN } from './config';

export const api = {
    async fetchTasks () {
        const response = await fetch(MAIN_URL, {
            method:  'GET',
            headers: {
                authorization: TOKEN,
            },
        });

        if (response.status !== 200) {
            throw new Error('Tasks were not loaded!');
        }

        const { data: tasks } = await response.json();

        return tasks;
    },

    async createTask (message) {
        const response = await fetch(MAIN_URL, {
            method:  'POST',
            headers: {
                authorization:  TOKEN,
                'content-type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (response.status !== 200) {
            throw new Error('Tasks were not created!');
        }

        const { data: task } = await response.json();

        return task;
    },

    async updateTask (id, message, completed, favorite) {
        const response = await fetch(`${MAIN_URL}`, {
            method:  'PUT',
            headers: {
                Authorization:  TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([
                {
                    id,
                    message,
                    completed,
                    favorite,
                }
            ]),
        });

        if (response.status !== 200) {
            throw new Error('Task was not updated!');
        }

        const { data: [task] } = await response.json();

        return task;
    },

    async completeAllTasks (task) {
        const response = await fetch(`${MAIN_URL}`, {
            method:  'PUT',
            headers: {
                Authorization:  TOKEN,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (response.status !== 200) {
            throw new Error('Task was not updated!');
        }

        const { data: tasks } = await response.json();

        return tasks;
    },

    async removeTask (id) {
        const response = await fetch(`${MAIN_URL}/${id}`, {
            method:  'DELETE',
            headers: {
                authorization: TOKEN,
            },
        });

        if (response.status !== 204) {
            throw new Error('Task was not deleted!');
        }

        return null;
    },
};
