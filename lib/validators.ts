// lib/validators.ts

import {db} from "@/lib/db";

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
    }
}

export async function validateGoalOverlap(
    startDate: Date,
    endDate: Date,
    userId: string,
    excludeGoalId?: string
): Promise<boolean> {
    const count = await db.goal.count({
        where: {
            userId,
            ...(excludeGoalId && { id: { not: excludeGoalId } }),
            AND: [
                { startDate: { lte: endDate } },
                { endDate: { gte: startDate } }
            ]
        }
    });

    return count === 0;
}

export async function validateTaskLimit(
    date: Date,
    userId: string,
    additionalTasks: number = 1
): Promise<boolean> {
    const MAX_TASKS_PER_DAY = 5;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingTaskCount = await db.task.count({
        where: {
            userId,
            date: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    });

    return (existingTaskCount + additionalTasks) <= MAX_TASKS_PER_DAY;
}

export function validateGoalDates(startDate: Date, endDate: Date): boolean {
    return endDate >= startDate;
}

export function validateGoalColor(color: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function validateGoalImpact(impact: number): boolean {
    return impact >= 1 && impact <= 5;
}