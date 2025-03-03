import { useState, useEffect } from 'react';
import axios from 'axios';
import { Task } from './use-goals';

export type TaskFormData = {
    title: string;
    description?: string;
    date: Date;
    goalId?: string;
    completed: boolean;
};

// Hook to fetch tasks for a date range
export function useTasks(startDate: Date, endDate: Date) {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTasks() {
            try {
                setLoading(true);
                const params = {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                };

                const { data } = await axios.get('/api/tasks', { params });

                // Convert string dates to Date objects
                const formattedTasks = data.map((task: any) => ({
                    ...task,
                    date: new Date(task.date),
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt),
                    goal: task.goal ? {
                        ...task.goal,
                        startDate: new Date(task.goal.startDate),
                        endDate: new Date(task.goal.endDate),
                        createdAt: new Date(task.goal.createdAt),
                        updatedAt: new Date(task.goal.updatedAt),
                    } : undefined,
                }));

                setTasks(formattedTasks);

                // Group tasks by date
                const groupedTasks: Record<string, Task[]> = {};
                formattedTasks.forEach((task: Task) => {
                    const dateKey = task.date.toISOString().split('T')[0];
                    if (!groupedTasks[dateKey]) {
                        groupedTasks[dateKey] = [];
                    }
                    groupedTasks[dateKey].push(task);
                });

                setTasksByDate(groupedTasks);
                setError(null);
            } catch (err) {
                console.error('Error fetching tasks:', err);
                setError('Failed to fetch tasks');
            } finally {
                setLoading(false);
            }
        }

        fetchTasks();
    }, [startDate, endDate]);

    return { tasks, tasksByDate, loading, error };
}

// Hook to fetch a single task
export function useTask(taskId: string | null) {
    const [task, setTask] = useState<Task | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTask() {
            if (!taskId) {
                setTask(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data } = await axios.get(`/api/tasks/${taskId}`);

                // Convert string dates to Date objects
                const formattedTask = {
                    ...data,
                    date: new Date(data.date),
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                    goal: data.goal ? {
                        ...data.goal,
                        startDate: new Date(data.goal.startDate),
                        endDate: new Date(data.goal.endDate),
                        createdAt: new Date(data.goal.createdAt),
                        updatedAt: new Date(data.goal.updatedAt),
                    } : undefined,
                };

                setTask(formattedTask);
                setError(null);
            } catch (err) {
                console.error('Error fetching task:', err);
                setError('Failed to fetch task');
            } finally {
                setLoading(false);
            }
        }

        fetchTask();
    }, [taskId]);

    return { task, loading, error };
}

// Hook to create a task
export function useCreateTask() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTask = async (taskData: TaskFormData) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/tasks', taskData);
            setError(null);
            return data;
        } catch (err: any) {
            console.error('Error creating task:', err);
            setError(err.response?.data?.error || 'Failed to create task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createTask, loading, error };
}

// Hook to update a task
export function useUpdateTask(taskId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateTask = async (taskData: TaskFormData) => {
        try {
            setLoading(true);
            const { data } = await axios.patch(`/api/tasks/${taskId}`, taskData);
            setError(null);
            return data;
        } catch (err: any) {
            console.error('Error updating task:', err);
            setError(err.response?.data?.error || 'Failed to update task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateTask, loading, error };
}

// Hook to delete a task
export function useDeleteTask() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteTask = async (taskId: string) => {
        try {
            setLoading(true);
            await axios.delete(`/api/tasks/${taskId}`);
            setError(null);
            return true;
        } catch (err: any) {
            console.error('Error deleting task:', err);
            setError(err.response?.data?.error || 'Failed to delete task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteTask, loading, error };
}

// Hook to toggle task completion status
export function useToggleTaskCompletion() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleCompletion = async (task: Task) => {
        try {
            setLoading(true);

            const updatedData: TaskFormData = {
                title: task.title,
                description: task.description,
                date: task.date,
                goalId: task.goalId,
                completed: !task.completed,
            };

            const { data } = await axios.patch(`/api/tasks/${task.id}`, updatedData);
            setError(null);
            return data;
        } catch (err: any) {
            console.error('Error toggling task completion:', err);
            setError(err.response?.data?.error || 'Failed to update task');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { toggleCompletion, loading, error };
}