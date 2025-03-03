import { db } from "@/lib/db";
import { Goal } from "@prisma/client";
import { startOfYear, endOfYear } from "date-fns";

export type GoalDTO = {
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    color: string;
    impact: number;
};

export type GoalWithTasks = Goal & {
    tasks: {
        id: string;
        title: string;
        date: Date;
        completed: boolean;
    }[];
};

export const getGoalsByYear = async (userId: string, year: number): Promise<GoalWithTasks[]> => {
    const startDate = startOfYear(new Date(year, 0, 1));
    const endDate = endOfYear(new Date(year, 0, 1));

    return db.goal.findMany({
        where: {
            userId,
            OR: [
                { startDate: { gte: startDate, lte: endDate } },
                { endDate: { gte: startDate, lte: endDate } },
                {
                    AND: [
                        { startDate: { lte: startDate } },
                        { endDate: { gte: endDate } }
                    ]
                }
            ]
        },
        include: {
            tasks: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    completed: true
                }
            }
        },
        orderBy: {
            startDate: 'asc'
        }
    });
};

export const getGoalById = async (id: string, userId: string): Promise<GoalWithTasks | null> => {
    return db.goal.findFirst({
        where: {
            id,
            userId
        },
        include: {
            tasks: {
                select: {
                    id: true,
                    title: true,
                    date: true,
                    completed: true
                }
            }
        }
    });
};

export const createGoal = async (userId: string, data: GoalDTO): Promise<Goal> => {
    return db.goal.create({
        data: {
            userId,
            ...data
        }
    });
};

export const updateGoal = async (id: string, userId: string, data: GoalDTO): Promise<Goal> => {
    return db.goal.update({
        where: {
            id,
            userId
        },
        data
    });
};

export const deleteGoal = async (id: string, userId: string): Promise<void> => {
    await db.goal.delete({
        where: {
            id,
            userId
        }
    });
};

export const checkGoalOverlap = async (
    userId: string,
    startDate: Date,
    endDate: Date,
    excludeGoalId?: string
): Promise<boolean> => {
    const query = {
        userId,
        startDate: { lte: endDate },
        endDate: { gte: startDate }
    };

    if (excludeGoalId) {
        const count = await db.goal.count({
            where: {
                ...query,
                NOT: {
                    id: excludeGoalId
                }
            }
        });
        return count > 0;
    }

    const count = await db.goal.count({
        where: query
    });

    return count > 0;
};