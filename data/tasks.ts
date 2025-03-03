import { db } from "@/lib/db";
import { Task } from "@prisma/client";
import { startOfDay, endOfDay, format } from "date-fns";

export type TaskDTO = {
    title: string;
    description?: string;
    date: Date;
    goalId?: string;
    completed: boolean;
};

export type TaskWithGoal = Task & {
    goal?: {
        id: string;
        title: string;
        color: string;
    } | null;
};

export type DayTasks = {
    [date: string]: TaskWithGoal[];
};

export const getTasksByDateRange = async (
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<DayTasks> => {
    const tasks = await db.task.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate
            }
        },
        include: {
            goal: {
                select: {
                    id: true,
                    title: true,
                    color: true
                }
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    const tasksByDate: DayTasks = {};

    for (const task of tasks) {
        const dateKey = format(task.date, 'yyyy-MM-dd');
        if (!tasksByDate[dateKey]) {
            tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
    }

    return tasksByDate;
};

export const getTasksByDate = async (
    userId: string,
    date: Date
): Promise<TaskWithGoal[]> => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return db.task.findMany({
        where: {
            userId,
            date: {
                gte: dayStart,
                lte: dayEnd
            }
        },
        include: {
            goal: {
                select: {
                    id: true,
                    title: true,
                    color: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        }
    });
};

export const getTaskById = async (
    id: string,
    userId: string
): Promise<TaskWithGoal | null> => {
    return db.task.findFirst({
        where: {
            id,
            userId
        },
        include: {
            goal: {
                select: {
                    id: true,
                    title: true,
                    color: true
                }
            }
        }
    });
};

export const createTask = async (
    userId: string,
    data: TaskDTO
): Promise<Task> => {
    return db.task.create({
        data: {
            userId,
            ...data
        }
    });
};

export const updateTask = async (
    id: string,
    userId: string,
    data: Partial<TaskDTO>
): Promise<Task> => {
    return db.task.update({
        where: {
            id,
            userId
        },
        data
    });
};

export const deleteTask = async (
    id: string,
    userId: string
): Promise<void> => {
    await db.task.delete({
        where: {
            id,
            userId
        }
    });
};

export const countTasksOnDate = async (
    userId: string,
    date: Date
): Promise<number> => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    return db.task.count({
        where: {
            userId,
            date: {
                gte: dayStart,
                lte: dayEnd
            }
        }
    });
};

export const validateTaskLimit = async (
    userId: string,
    date: Date,
    excludeTaskId?: string
): Promise<boolean> => {
    const MAX_TASKS_PER_DAY = 5;

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const query = {
        userId,
        date: {
            gte: dayStart,
            lte: dayEnd
        }
    };

    let count;

    if (excludeTaskId) {
        count = await db.task.count({
            where: {
                ...query,
                NOT: {
                    id: excludeTaskId
                }
            }
        });
    } else {
        count = await db.task.count({
            where: query
        });
    }

    return count < MAX_TASKS_PER_DAY;
};