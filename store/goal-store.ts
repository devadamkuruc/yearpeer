import { create } from 'zustand';
import { GoalWithTasks } from '@/data/goals';
import { fetchGoalsByYear, addGoal, editGoal, removeGoal } from '@/actions/goals';
import { DateRange } from '@/types';

export interface GoalModalState {
    showModal: boolean;
    editingGoal?: GoalWithTasks;
    selectedRange?: DateRange;
    error: string | null;
}

interface GoalState {
    goals: GoalWithTasks[];
    currentYear: number;
    isLoading: boolean;
    error: string | null;
    modal: GoalModalState;

    // Actions
    setGoals: (goals: GoalWithTasks[]) => void;
    setCurrentYear: (year: number) => void;
    fetchGoals: (year?: number) => Promise<void>;
    createGoal: (goal: any) => Promise<void>;
    updateGoal: (id: string, goal: any) => Promise<void>;
    deleteGoal: (id: string) => Promise<void>;

    // Modal actions
    openModal: (range?: DateRange) => void;
    openEditModal: (goal: GoalWithTasks) => void;
    closeModal: () => void;
    setModalError: (error: string | null) => void;

    // Helper functions
    hasOverlap: (start: Date, end: Date, excludeGoalId?: string) => boolean;
}

const useGoalStore = create<GoalState>((set, get) => ({
    goals: [],
    currentYear: new Date().getFullYear(),
    isLoading: false,
    error: null,
    modal: {
        showModal: false,
        editingGoal: undefined,
        selectedRange: undefined,
        error: null,
    },

    // Actions
    setGoals: (goals) => set({ goals }),
    setCurrentYear: (year) => set({ currentYear: year }),

    fetchGoals: async (year) => {
        const yearToFetch = year || get().currentYear;
        set({ isLoading: true, error: null });

        try {
            const goals = await fetchGoalsByYear(yearToFetch);
            set({ goals, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch goals:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch goals',
                isLoading: false,
            });
        }
    },

    createGoal: async (goal) => {
        set({ isLoading: true });
        try {
            const result = await addGoal(goal);

            if (!result.success) {
                set((state) => ({
                    modal: { ...state.modal, error: result.error || 'Failed to create goal' },
                    isLoading: false,
                }));
                return;
            }

            if (result.goal) {
                set((state) => ({
                    goals: [...state.goals, result.goal!],
                    isLoading: false,
                }));
            }

            // Close modal on success
            get().closeModal();
        } catch (error) {
            console.error('Failed to create goal:', error);
            set((state) => ({
                modal: {
                    ...state.modal,
                    error: error instanceof Error ? error.message : 'Failed to create goal'
                },
                isLoading: false,
            }));
        }
    },

    updateGoal: async (id, goal) => {
        set({ isLoading: true });
        try {
            const result = await editGoal(id, goal);

            if (!result.success) {
                set((state) => ({
                    modal: { ...state.modal, error: result.error || 'Failed to update goal' },
                    isLoading: false,
                }));
                return;
            }

            if (result.goal) {
                set((state) => ({
                    goals: state.goals.map(g => g.id === id ? result.goal! : g),
                    isLoading: false,
                }));
            }

            // Close modal on success
            get().closeModal();
        } catch (error) {
            console.error('Failed to update goal:', error);
            set((state) => ({
                modal: {
                    ...state.modal,
                    error: error instanceof Error ? error.message : 'Failed to update goal'
                },
                isLoading: false,
            }));
        }
    },

    deleteGoal: async (id) => {
        set({ isLoading: true });
        try {
            const result = await removeGoal(id);

            if (!result.success) {
                set((state) => ({
                    modal: { ...state.modal, error: result.error || 'Failed to delete goal' },
                    isLoading: false,
                }));
                return;
            }

            set((state) => ({
                goals: state.goals.filter(g => g.id !== id),
                isLoading: false,
            }));

            // Close modal on success
            get().closeModal();
        } catch (error) {
            console.error('Failed to delete goal:', error);
            set((state) => ({
                modal: {
                    ...state.modal,
                    error: error instanceof Error ? error.message : 'Failed to delete goal'
                },
                isLoading: false,
            }));
        }
    },

    // Modal actions
    openModal: (range) => {
        set((state) => ({
            modal: {
                ...state.modal,
                showModal: true,
                selectedRange: range,
                editingGoal: undefined,
                error: null,
            },
        }));
    },

    openEditModal: (goal) => {
        set((state) => ({
            modal: {
                ...state.modal,
                showModal: true,
                editingGoal: goal,
                selectedRange: undefined,
                error: null,
            },
        }));
    },

    closeModal: () => {
        set((state) => ({
            modal: {
                ...state.modal,
                showModal: false,
                editingGoal: undefined,
                selectedRange: undefined,
                error: null,
            },
        }));
    },

    setModalError: (error) => {
        set((state) => ({
            modal: { ...state.modal, error },
        }));
    },

    // Helper functions
    hasOverlap: (start, end, excludeGoalId) => {
        const { goals } = get();
        return goals.some(goal =>
            goal.id !== excludeGoalId &&
            start <= goal.endDate &&
            end >= goal.startDate
        );
    },
}));

export default useGoalStore;