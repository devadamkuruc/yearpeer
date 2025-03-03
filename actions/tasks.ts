"use server";

import { auth } from "@/auth";
import {
    countTasksOnDate,
    createTask,
    deleteTask,
    getTaskById,
    getTasksByDate,
    getTasksByDateRange,
    TaskDTO,
    TaskWithGoal,
    updateTask,
    validateTaskLimit
} from "@/data/tasks";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MAX_TASKS_PER_DAY = 5;

const taskSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().optional(),
    date: z.date(),
    goalId: z.string().optional(),
    completed: z.boolean(),
});

export async function fetchTasksByDate(date: Date): Promise<TaskWithGoal[]> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getTasksByDate(session.user.id, date);
}

export async function fetchTasksByDateRange(startDate: Date, endDate: Date) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getTasksByDateRange(session.user.id, startDate, endDate);
}

export async function addTask(formData: TaskDTO): Promise<{ success: boolean; error?: string; task?: TaskWithGoal }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validatedFields = taskSchema.safeParse(formData);
        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.errors[0]?.message || "Invalid data"
            };
        }

        // Check task limit
        const count = await countTasksOnDate(session.user.id, formData.date);
        if (count >= MAX_TASKS_PER_DAY) {
            return { success: false, error: `Cannot exceed ${MAX_TASKS_PER_DAY} tasks per day` };
        }

        const task = await createTask(session.user.id, formData);
        revalidatePath("/calendar");

        // Fetch complete task with goal to return
        const taskWithGoal = await getTaskById(task.id, session.user.id);

        return {
            success: true,
            task: taskWithGoal || undefined
        };
    } catch (error) {
        console.error("Error creating task:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create task"
        };
    }
}

export async function editTask(id: string, formData: Partial<TaskDTO>): Promise<{ success: boolean; error?: string; task?: TaskWithGoal }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Only validate the fields that are provided
        const partialSchema = taskSchema.partial();
        const validatedFields = partialSchema.safeParse(formData);
        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.errors[0]?.message || "Invalid data"
            };
        }

        // Check if task exists and belongs to user
        const existingTask = await getTaskById(id, session.user.id);
        if (!existingTask) {
            return { success: false, error: "Task not found" };
        }

        // If date is changing, check task limit
        if (formData.date && existingTask.date.toDateString() !== formData.date.toDateString()) {
            const isValid = await validateTaskLimit(session.user.id, formData.date, id);
            if (!isValid) {
                return { success: false, error: `Cannot exceed ${MAX_TASKS_PER_DAY} tasks per day` };
            }
        }

        const task = await updateTask(id, session.user.id, formData);
        revalidatePath("/calendar");

        // Fetch updated task with goal to return
        const updatedTask = await getTaskById(id, session.user.id);

        return {
            success: true,
            task: updatedTask || undefined
        };
    } catch (error) {
        console.error("Error updating task:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update task"
        };
    }
}

export async function removeTask(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if task exists and belongs to user
        const existingTask = await getTaskById(id, session.user.id);
        if (!existingTask) {
            return { success: false, error: "Task not found" };
        }

        await deleteTask(id, session.user.id);
        revalidatePath("/calendar");

        return { success: true };
    } catch (error) {
        console.error("Error deleting task:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete task"
        };
    }
}

export async function toggleTaskCompletion(id: string, completed: boolean): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if task exists and belongs to user
        const existingTask = await getTaskById(id, session.user.id);
        if (!existingTask) {
            return { success: false, error: "Task not found" };
        }

        await updateTask(id, session.user.id, { completed });
        revalidatePath("/calendar");

        return { success: true };
    } catch (error) {
        console.error("Error updating task completion:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update task"
        };
    }
}