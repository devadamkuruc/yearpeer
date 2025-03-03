import { useState, useEffect } from 'react';
import axios from 'axios';

export type Goal = {
    id: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    color: string;
    impact: number;
    tasks?: Task[];
    createdAt: Date;
    updatedAt: Date;
};

export type Task = {
    id: string;
    title: string;
    description?: string;
    date: Date;
    completed: boolean;
    goalId?: string;
    goal?: Goal;
    createdAt: Date;
    updatedAt: Date;
};

export type GoalFormData = {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    color: string;
    impact: number;
};

// Hook to fetch goals for a specific year or date range
export function useGoals(year?: number, startDate?: Date, endDate?: Date) {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGoals() {
            try {
                setLoading(true);
                let url = '/api/goals';
                const params: Record<string, string> = {};

                if (year) {
                    params.year = year.toString();
                } else if (startDate && endDate) {
                    params.startDate = startDate.toISOString();
                    params.endDate = endDate.toISOString();
                }

                const { data } = await axios.get(url, { params });

                // Convert string dates to Date objects
                const formattedGoals = data.map((goal: any) => ({
                    ...goal,
                    startDate: new Date(goal.startDate),
                    endDate: new Date(goal.endDate),
                    createdAt: new Date(goal.createdAt),
                    updatedAt: new Date(goal.updatedAt),
                    tasks: goal.tasks?.map((task: any) => ({
                        ...task,
                        date: new Date(task.date),
                        createdAt: new Date(task.createdAt),
                        updatedAt: new Date(task.updatedAt),
                    })),
                }));

                setGoals(formattedGoals);
                setError(null);
            } catch (err) {
                console.error('Error fetching goals:', err);
                setError('Failed to fetch goals');
            } finally {
                setLoading(false);
            }
        }

        fetchGoals();
    }, [year, startDate, endDate]);

    return { goals, loading, error };
}

// Hook to fetch a single goal
export function useGoal(goalId: string | null) {
    const [goal, setGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchGoal() {
            if (!goalId) {
                setGoal(null);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const { data } = await axios.get(`/api/goals/${goalId}`);

                // Convert string dates to Date objects
                const formattedGoal = {
                    ...data,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    createdAt: new Date(data.createdAt),
                    updatedAt: new Date(data.updatedAt),
                    tasks: data.tasks?.map((task: any) => ({
                        ...task,
                        date: new Date(task.date),
                        createdAt: new Date(task.createdAt),
                        updatedAt: new Date(task.updatedAt),
                    })),
                };

                setGoal(formattedGoal);
                setError(null);
            } catch (err) {
                console.error('Error fetching goal:', err);
                setError('Failed to fetch goal');
            } finally {
                setLoading(false);
            }
        }

        fetchGoal();
    }, [goalId]);

    return { goal, loading, error };
}

// Hook to create a goal
export function useCreateGoal() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createGoal = async (goalData: GoalFormData) => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/goals', goalData);
            setError(null);
            return data;
        } catch (err: any) {
            console.error('Error creating goal:', err);
            setError(err.response?.data?.error || 'Failed to create goal');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { createGoal, loading, error };
}

// Hook to update a goal
export function useUpdateGoal(goalId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateGoal = async (goalData: GoalFormData) => {
        try {
            setLoading(true);
            const { data } = await axios.put(`/api/goals/${goalId}`, goalData);
            setError(null);
            return data;
        } catch (err: any) {
            console.error('Error updating goal:', err);
            setError(err.response?.data?.error || 'Failed to update goal');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateGoal, loading, error };
}

// Hook to delete a goal
export function useDeleteGoal() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteGoal = async (goalId: string) => {
        try {
            setLoading(true);
            await axios.delete(`/api/goals/${goalId}`);
            setError(null);
            return true;
        } catch (err: any) {
            console.error('Error deleting goal:', err);
            setError(err.response?.data?.error || 'Failed to delete goal');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteGoal, loading, error };
}