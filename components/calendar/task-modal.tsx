"use client";

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useTaskStore from '@/store/task-store';
import useGoalStore from '@/store/goal-store';
import { MAX_TASKS_PER_DAY } from '@/constants';
import { TaskWithGoal } from '@/data/tasks';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
                                                 isOpen,
                                                 onClose,
                                                 date,
                                             }) => {
    const { createTask, updateTask, deleteTask, fetchTasksForDate, getTasksForDate, toggleCompletion, modal } = useTaskStore();
    const { goals } = useGoalStore();
    const error = modal.error;

    const [tasks, setTasks] = useState<TaskWithGoal[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState('');
    const [editingTaskDescription, setEditingTaskDescription] = useState('');
    const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState(false);

    // Load tasks when modal opens or date changes
    useEffect(() => {
        if (isOpen && date) {
            const loadTasks = async () => {
                try {
                    // Reset any existing tasks first
                    setTasks([]);

                    // Then fetch new tasks for this date
                    let dateTasks = getTasksForDate(date);
                    if (dateTasks.length === 0) {
                        dateTasks = await fetchTasksForDate(date);
                    }
                    setTasks(dateTasks);
                } catch (error) {
                    console.error("Error loading tasks:", error);
                }
            };

            loadTasks();
            resetForm();
        }
    }, [isOpen, date, fetchTasksForDate, getTasksForDate]);

    // Filter goals that are active on the selected date
    const availableGoals = date ? goals.filter(goal =>
        date >= goal.startDate && date <= goal.endDate
    ) : [];

    const resetForm = () => {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setSelectedGoalId(undefined);
        setEditingTaskId(null);
        setEditingTaskTitle('');
        setEditingTaskDescription('');
    };

    const handleAddTask = async () => {
        if (!newTaskTitle.trim() || !date || tasks.length >= MAX_TASKS_PER_DAY) return;

        setIsLoading(true);
        try {
            await createTask({
                title: newTaskTitle.trim(),
                description: newTaskDescription.trim(),
                goalId: selectedGoalId,
                date: date,
                completed: false
            });

            // Refresh tasks
            const updatedTasks = await fetchTasksForDate(date);
            setTasks(updatedTasks);

            resetForm();
        } catch (error) {
            console.error("Error adding task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!date) return;

        setIsLoading(true);
        try {
            await deleteTask(taskId);

            // Refresh tasks
            const updatedTasks = await fetchTasksForDate(date);
            setTasks(updatedTasks);

            if (editingTaskId === taskId) {
                cancelEditing();
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const startEditing = (task: TaskWithGoal) => {
        if (typeof task.id !== 'string') {
            console.error("Cannot edit task with invalid ID");
            return;
        }

        setEditingTaskId(task.id);
        setEditingTaskTitle(task.title);
        setEditingTaskDescription(task.description || '');
        setSelectedGoalId(task.goalId || undefined);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditingTaskTitle('');
        setEditingTaskDescription('');
        setSelectedGoalId(undefined);
    };

    const saveEditing = async (task: TaskWithGoal) => {
        if (!editingTaskTitle.trim() || !date || typeof task.id !== 'string') return;

        setIsLoading(true);
        try {
            await updateTask(task.id, {
                title: editingTaskTitle.trim(),
                description: editingTaskDescription.trim(),
                goalId: selectedGoalId,
                date: task.date,
                completed: task.completed
            });

            // Refresh tasks
            const updatedTasks = await fetchTasksForDate(date);
            setTasks(updatedTasks);

            cancelEditing();
        } catch (error) {
            console.error("Error updating task:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle task completion toggle
    const handleTaskCompletionToggle = async (index: number, completed: boolean) => {
        if (!date) return;

        // Get the task by index
        const taskToUpdate = tasks[index];
        if (!taskToUpdate || typeof taskToUpdate.id !== 'string') {
            // Skip if task doesn't exist or has no valid ID
            console.warn("Cannot toggle completion: Task has no valid ID");
            return;
        }

        setIsLoading(true);
        try {
            // Use the toggleCompletion function from the store - ID is guaranteed to be a string here
            await toggleCompletion(taskToUpdate.id, completed);

            // The store will update its state, but we'll update local state as well
            // for immediate UI feedback
            setTasks(prevTasks =>
                prevTasks.map((task, idx) =>
                    idx === index ? {...task, completed} : task
                )
            );
        } catch (error) {
            console.error("Error updating task completion:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!date) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl sm:max-w-2xl max-h-[35rem] overflow-auto" aria-describedby="dialog-description">
                <DialogHeader>
                    <DialogTitle>
                        Tasks for {date ? format(date, 'MMMM d, yyyy') : ''}
                    </DialogTitle>
                    {error ? (
                        <DialogDescription className="text-red-500">
                            {error}
                        </DialogDescription>
                    ) : (
                        <DialogDescription id="dialog-description" className="text-gray-500">
                            Manage your tasks for this day
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {tasks.length < MAX_TASKS_PER_DAY && (
                        <div className="space-y-4 border-b pb-4">
                            <h3 className="text-lg font-medium">Add New Task</h3>
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="new-task-title">Task Title</Label>
                                <Input
                                    id="new-task-title"
                                    placeholder="Enter task title..."
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleAddTask();
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="new-task-description">Task Description</Label>
                                <Textarea
                                    id="new-task-description"
                                    placeholder="Enter task description (optional)..."
                                    value={newTaskDescription}
                                    onChange={(e) => setNewTaskDescription(e.target.value)}
                                    className="min-h-[4rem] max-h-[10rem]"
                                />
                            </div>

                            {availableGoals.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="goal-select">Associated Goal (Optional)</Label>
                                    <Select
                                        value={selectedGoalId || "none"}
                                        onValueChange={(value) => setSelectedGoalId(value === "none" ? undefined : value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="No associated goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="none">No associated goal</SelectItem>
                                                {availableGoals.map(goal => (
                                                    <SelectItem key={goal.id} value={goal.id}>
                                                        {goal.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Button
                                onClick={handleAddTask}
                                disabled={isLoading || !newTaskTitle.trim() || tasks.length >= MAX_TASKS_PER_DAY}
                                className="w-full"
                            >
                                {isLoading ? 'Adding...' : 'Add Task'}
                            </Button>
                        </div>
                    )}

                    {tasks.length === MAX_TASKS_PER_DAY && (
                        <div className="text-sm text-yellow-600 mb-2">
                            Maximum {MAX_TASKS_PER_DAY} tasks per day reached
                        </div>
                    )}

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Current Tasks</h3>
                        {tasks.length === 0 ? (
                            <p className="text-gray-500 italic">No tasks for this day yet.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {tasks.map((task, index) => (
                                    <div
                                        key={task.id}
                                        className="border rounded-md p-3 hover:bg-gray-50 transition-colors"
                                    >
                                        {editingTaskId === task.id ? (
                                            // Editing mode
                                            <div className="space-y-3">
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`edit-title-${task.id}`}>Task Title</Label>
                                                    <Input
                                                        id={`edit-title-${task.id}`}
                                                        value={editingTaskTitle}
                                                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                        autoFocus
                                                    />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor={`edit-desc-${task.id}`}>Description</Label>
                                                    <Textarea
                                                        id={`edit-desc-${task.id}`}
                                                        value={editingTaskDescription}
                                                        onChange={(e) => setEditingTaskDescription(e.target.value)}
                                                        placeholder="Task description (optional)"
                                                        className="min-h-[4rem]"
                                                    />
                                                </div>

                                                {availableGoals.length > 0 && (
                                                    <div className="flex flex-col gap-2">
                                                        <Label htmlFor={`edit-goal-${task.id}`}>Associated Goal</Label>
                                                        <Select
                                                            value={selectedGoalId || ""}
                                                            onValueChange={(value) => setSelectedGoalId(value || undefined)}
                                                        >
                                                            <SelectTrigger id={`edit-goal-${task.id}`}>
                                                                <SelectValue placeholder="No associated goal" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    <SelectItem value="">No associated goal</SelectItem>
                                                                    {availableGoals.map(goal => (
                                                                        <SelectItem key={goal.id} value={goal.id}>
                                                                            {goal.title}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}

                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button
                                                        variant="ghost"
                                                        onClick={cancelEditing}
                                                        disabled={isLoading}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => saveEditing(task)}
                                                        disabled={isLoading || !editingTaskTitle.trim()}
                                                    >
                                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Display mode
                                            <div className="flex items-start gap-3">
                                                <div className="pt-1">
                                                    <Checkbox
                                                        id={`task-${task.id || ""}`}
                                                        checked={task.completed}
                                                        onCheckedChange={(checked) => {
                                                            if (typeof checked === 'boolean' && typeof task.id === 'string') {
                                                                // Only call if task.id is definitely a string, not null
                                                                toggleCompletion(task.id, checked);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col">
                                                        <Label
                                                            htmlFor={`task-${index}`}
                                                            className={`text-base ${task.completed ? 'line-through text-gray-500' : 'font-medium'}`}
                                                        >
                                                            {task.title}
                                                        </Label>

                                                        {task.description && (
                                                            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {task.description}
                                                            </p>
                                                        )}

                                                        {task.goal && (
                                                            <div className="flex items-center mt-2">
                                                                <div
                                                                    className="w-3 h-3 rounded-full mr-2"
                                                                    style={{ backgroundColor: task.goal.color }}
                                                                />
                                                                <span className="text-xs text-gray-500">
                                                                    {task.goal.title}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (typeof task.id === 'string') {
                                                                startEditing(task);
                                                            }
                                                        }}
                                                        disabled={isLoading || typeof task.id !== 'string'}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                                            <path d="m15 5 4 4"></path>
                                                        </svg>
                                                        <span className="sr-only">Edit</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (typeof task.id === 'string') {
                                                                handleDeleteTask(task.id);
                                                            }
                                                        }}
                                                        disabled={isLoading || typeof task.id !== 'string'}
                                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18"></path>
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                        </svg>
                                                        <span className="sr-only">Delete</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
};

export default TaskModal;