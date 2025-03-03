"use server";

import { auth } from "@/auth";
import {
    checkGoalOverlap,
    createGoal,
    deleteGoal,
    getGoalById,
    getGoalsByYear,
    GoalDTO,
    updateGoal,
    GoalWithTasks
} from "@/data/goals";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const goalSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title is too long"),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
    impact: z.number().int().min(1).max(5),
});

export async function fetchGoalsByYear(year: number): Promise<GoalWithTasks[]> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getGoalsByYear(session.user.id, year);
}

export async function fetchGoalById(id: string): Promise<GoalWithTasks | null> {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    return getGoalById(id, session.user.id);
}

export async function addGoal(formData: GoalDTO): Promise<{ success: boolean; error?: string; goal?: GoalWithTasks }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validatedFields = goalSchema.safeParse(formData);
        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.errors[0]?.message || "Invalid data"
            };
        }

        const { startDate, endDate } = formData;
        if (endDate < startDate) {
            return { success: false, error: "End date cannot be before start date" };
        }

        // Check for overlap
        const hasOverlap = await checkGoalOverlap(session.user.id, startDate, endDate);
        if (hasOverlap) {
            return { success: false, error: "A goal already exists during this time period" };
        }

        const goal = await createGoal(session.user.id, formData);
        revalidatePath("/calendar");

        // Fetch the complete goal with tasks to return
        const goalWithTasks = await getGoalById(goal.id, session.user.id);

        return {
            success: true,
            goal: goalWithTasks || undefined
        };
    } catch (error) {
        console.error("Error creating goal:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create goal"
        };
    }
}

export async function editGoal(id: string, formData: GoalDTO): Promise<{ success: boolean; error?: string; goal?: GoalWithTasks }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const validatedFields = goalSchema.safeParse(formData);
        if (!validatedFields.success) {
            return {
                success: false,
                error: validatedFields.error.errors[0]?.message || "Invalid data"
            };
        }

        // Check if goal exists and belongs to user
        const existingGoal = await getGoalById(id, session.user.id);
        if (!existingGoal) {
            return { success: false, error: "Goal not found" };
        }

        const { startDate, endDate } = formData;
        if (endDate < startDate) {
            return { success: false, error: "End date cannot be before start date" };
        }

        // Check for overlap with other goals (excluding this one)
        const hasOverlap = await checkGoalOverlap(session.user.id, startDate, endDate, id);
        if (hasOverlap) {
            return { success: false, error: "A goal already exists during this time period" };
        }

        await updateGoal(id, session.user.id, formData);
        revalidatePath("/calendar");

        // Fetch the updated goal with tasks to return
        const updatedGoal = await getGoalById(id, session.user.id);

        return {
            success: true,
            goal: updatedGoal || undefined
        };
    } catch (error) {
        console.error("Error updating goal:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update goal"
        };
    }
}

export async function removeGoal(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        // Check if goal exists and belongs to user
        const existingGoal = await getGoalById(id, session.user.id);
        if (!existingGoal) {
            return { success: false, error: "Goal not found" };
        }

        await deleteGoal(id, session.user.id);
        revalidatePath("/calendar");

        return { success: true };
    } catch (error) {
        console.error("Error deleting goal:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete goal"
        };
    }
}