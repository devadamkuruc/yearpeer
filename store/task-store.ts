import { create } from 'zustand';
import { DayTasks, TaskWithGoal } from '@/data/tasks';
import {
    fetchTasksByDate,
    fetchTasksByDateRange,
    addTask,
    editTask,
    removeTask,
    toggleTaskCompletion
} from '@/actions/tasks';
import {format} from "date-fns";

interface TaskModalState {
    showModal: boolean;
    selectedDate: Date | null;
    error: string | null;
}

interface TaskState {
    tasks: DayTasks;
    isLoading: boolean;
    error: string | null;
    modal: TaskModalState;

    // Actions
    fetchTasksForDate: (date: Date) => Promise<TaskWithGoal[]>;
    fetchTasksForMonth: (year: number, month: number) => Promise<void>;
    createTask: (task: any) => Promise<void>;
    updateTask: (id: string, task: any) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleCompletion: (id: string, completed: boolean) => Promise<void>;

    // Helper methods
    getTasksForDate: (date: Date) => TaskWithGoal[];

    // Modal actions
    openTaskModal: (date: Date) => void;
    closeTaskModal: () => void;
    setTaskModalError: (error: string | null) => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
    tasks: {},
    isLoading: false,
    error: null,
    modal: {
        showModal: false,
        selectedDate: null,
        error: null
    },

    fetchTasksForDate: async (date) => {
        set({ isLoading: true, error: null });

        try {
            const tasks = await fetchTasksByDate(date);
            const dateKey = format(date, 'yyyy-MM-dd');

            set((state) => ({
                tasks: {
                    ...state.tasks,
                    [dateKey]: tasks
                },
                isLoading: false
            }));

            return tasks;
        } catch (error) {
            console.error('Failed to fetch tasks for date:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch tasks',
                isLoading: false
            });
            return [];
        }
    },

    fetchTasksForMonth: async (year, month) => {
        set({ isLoading: true, error: null });

        try {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0); // Last day of month

            const tasksByDate = await fetchTasksByDateRange(startDate, endDate);

            set((state) => ({
                tasks: {
                    ...state.tasks,
                    ...tasksByDate
                },
                isLoading: false
            }));
        } catch (error) {
            console.error('Failed to fetch tasks for month:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch tasks',
                isLoading: false
            });
        }
    },

    createTask: async (task) => {
        set({ isLoading: true });

        try {
            const result = await addTask(task);

            if (!result.success) {
                set((state) => ({
                    modal: { ...state.modal, error: result.error || 'Failed to create task' },
                    isLoading: false
                }));
                return;
            }

            if (result.task) {
                const dateKey = format(result.task.date, 'yyyy-MM-dd');

                set((state) => {
                    const currentTasks = state.tasks[dateKey] || [];

                    return {
                        tasks: {
                            ...state.tasks,
                            [dateKey]: [...currentTasks, result.task!]
                        },
                        isLoading: false
                    };
                });
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            set((state) => ({
                modal: {
                    ...state.modal,
                    error: error instanceof Error ? error.message : 'Failed to create task'
                },
                isLoading: false
            }));
        }
    },

    updateTask: async (id, task) => {
        set({ isLoading: true });

        try {
            const result = await editTask(id, task);

            if (!result.success) {
                set((state) => ({
                    modal: { ...state.modal, error: result.error || 'Failed to update task' },
                    isLoading: false
                }));
                return;
            }

            if (result.task) {
                set((state) => {
                    // Find and remove the task from its old date
                    let newTasks = { ...state.tasks };

                    // Find which date had this task
                    let oldDateKey: string | null = null;
                    for (const [date, tasks] of Object.entries(newTasks)) {
                        if (tasks.some(t => t.id === id)) {
                            oldDateKey = date;
                            break;
                        }
                    }

                    // Remove from old date if found
                    if (oldDateKey) {
                        newTasks[oldDateKey] = newTasks[oldDateKey].filter(t => t.id !== id);
                        if (newTasks[oldDateKey].length === 0) {
                            delete newTasks[oldDateKey];
                        }
                    }

                    // Add to new date
                    const newDateKey = format(result.task!.date, 'yyyy-MM-dd');
                    if (!newTasks[newDateKey]) {
                        newTasks[newDateKey] = [];
                    }

                    newTasks[newDateKey] = [...newTasks[newDateKey], result.task!];

                    return {
                        tasks: newTasks,
                        isLoading: false
                    };
                });
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            set((state) => ({
                modal: {
                    ...state.modal,
                    error: error instanceof Error ? error.message : 'Failed to update task'
                },
                isLoading: false
            }));
        }
    },

    deleteTask: async (id) => {
        set({ isLoading: true });

        try {
            const result = await removeTask(id);

            if (!result.success) {
                set((state) => ({
                    modal: { ...state.modal, error: result.error || 'Failed to delete task' },
                    isLoading: false
                }));
                return;
            }

            set((state) => {
                let newTasks = { ...state.tasks };

                // Find and remove the task
                for (const dateKey of Object.keys(newTasks)) {
                    if (newTasks[dateKey].some(t => t.id === id)) {
                        newTasks[dateKey] = newTasks[dateKey].filter(t => t.id !== id);

                        if (newTasks[dateKey].length === 0) {
                            delete newTasks[dateKey];
                        }

                        break;
                    }
                }

                return {
                    tasks: newTasks,
                    isLoading: false
                };
            });
        } catch (error) {
            console.error('Failed to delete task:', error);
            set((state) => ({
                modal: {
                    ...state.modal,
                    error: error instanceof Error ? error.message : 'Failed to delete task'
                },
                isLoading: false
            }));
        }
    },

    toggleCompletion: async (id, completed) => {
        set({ isLoading: true });

        try {
            const result = await toggleTaskCompletion(id, completed);

            if (!result.success) {
                set((state) => ({
                    error: result.error || 'Failed to update task',
                    isLoading: false
                }));
                return;
            }

            set((state) => {
                let newTasks = { ...state.tasks };

                // Find and update the task
                for (const dateKey of Object.keys(newTasks)) {
                    const task = newTasks[dateKey].find(t => t.id === id);

                    if (task) {
                        task.completed = completed;
                        break;
                    }
                }

                return {
                    tasks: newTasks,
                    isLoading: false
                };
            });
        } catch (error) {
            console.error('Failed to toggle task completion:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to update task',
                isLoading: false
            });
        }
    },

    getTasksForDate: (date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return get().tasks[dateKey] || [];
    },

    openTaskModal: (date) => {
        set((state) => ({
            modal: {
                ...state.modal,
                showModal: true,
                selectedDate: date,
                error: null
            }
        }));
    },

    closeTaskModal: () => {
        set((state) => ({
            modal: {
                ...state.modal,
                showModal: false,
                selectedDate: null,
                error: null
            }
        }));
    },

    setTaskModalError: (error) => {
        set((state) => ({
            modal: { ...state.modal, error }
        }));
    }
}));

export default useTaskStore;