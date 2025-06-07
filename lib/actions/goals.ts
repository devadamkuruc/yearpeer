'use server'

import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createGoal(formData: FormData) {
    try {
        const { userId } = await auth()

        if (!userId) {
            throw new Error('Unauthorized')
        }

        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const color = formData.get('color') as string
        const startDate = formData.get('startDate') as string
        const endDate = formData.get('endDate') as string

        if (!title?.trim()) {
            throw new Error('Title is required')
        }

        if (!color.trim()) {
            throw new Error('Start date is required')
        }

        if (!startDate) {
            throw new Error('Start date is required')
        }

        if (!endDate) {
            throw new Error('End date is required')
        }

        const parsedStartDate = new Date(startDate)
        const parsedEndDate = new Date(endDate)

        if (isNaN(parsedStartDate.getTime())) {
            throw new Error('Invalid start date')
        }

        if (isNaN(parsedEndDate.getTime())) {
            throw new Error('Invalid end date')
        }

        if (parsedEndDate <= parsedStartDate) {
            throw new Error('End date must be after start date')
        }

        // Find the user in your database
        const user = await prisma.user.findUnique({
            where: { clerkId: userId }
        })

        if (!user) {
            throw new Error('User not found')
        }

        // Create the goal
        const goal = await prisma.goal.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                color: color.trim(),
                startDate: parsedStartDate,
                endDate: parsedEndDate,
                authorId: user.id
            }
        })

        // Revalidate the page to show the new goal
        revalidatePath('/calendar')

        return { success: true, goal }
    } catch (error) {
        console.error('Error creating goal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create goal'
        }
    }
}

export async function getUserGoals() {
    try {
        const { userId } = await auth()

        if (!userId) {
            throw new Error('Unauthorized')
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                goals: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })

        if (!user) {
            throw new Error('User not found')
        }

        return { success: true, goals: user.goals }
    } catch (error) {
        console.error('Error fetching goals:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch goals'
        }
    }
}

export async function updateGoal(formData: FormData) {
    try {
        const { userId } = await auth()

        if (!userId) {
            throw new Error('Unauthorized')
        }

        const id = formData.get('id') as string
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const color = formData.get('color') as string
        const startDate = formData.get('startDate') as string
        const endDate = formData.get('endDate') as string

        if (!id) {
            throw new Error('Goal ID is required')
        }

        if (!title?.trim()) {
            throw new Error('Title is required')
        }

        if (!color?.trim()) {
            throw new Error('Title is required')
        }

        if (!startDate) {
            throw new Error('Start date is required')
        }

        if (!endDate) {
            throw new Error('End date is required')
        }

        const parsedStartDate = new Date(startDate)
        const parsedEndDate = new Date(endDate)

        if (isNaN(parsedStartDate.getTime())) {
            throw new Error('Invalid start date')
        }

        if (isNaN(parsedEndDate.getTime())) {
            throw new Error('Invalid end date')
        }

        if (parsedEndDate <= parsedStartDate) {
            throw new Error('End date must be after start date')
        }

        // Verify the goal belongs to the current user
        const existingGoal = await prisma.goal.findFirst({
            where: {
                id: parseInt(id),
                author: {
                    clerkId: userId
                }
            }
        })

        if (!existingGoal) {
            throw new Error('Goal not found or you do not have permission to edit it')
        }

        // Update the goal
        const goal = await prisma.goal.update({
            where: { id: parseInt(id) },
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                color: color?.trim(),
                startDate: parsedStartDate,
                endDate: parsedEndDate,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Revalidate to update the UI
        revalidatePath('/calendar')

        return { success: true, goal }
    } catch (error) {
        console.error('Error updating goal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update goal'
        }
    }
}

export async function deleteGoal(goalId: number) {
    try {
        const { userId } = await auth()

        if (!userId) {
            throw new Error('Unauthorized')
        }

        // Verify the goal belongs to the current user
        const existingGoal = await prisma.goal.findFirst({
            where: {
                id: goalId,
                author: {
                    clerkId: userId
                }
            }
        })

        if (!existingGoal) {
            throw new Error('Goal not found or you do not have permission to delete it')
        }

        // Delete the goal (this will also cascade delete related tasks due to foreign key constraints)
        await prisma.goal.delete({
            where: { id: goalId }
        })

        // Revalidate to update the UI
        revalidatePath('/calendar')

        return { success: true }
    } catch (error) {
        console.error('Error deleting goal:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete goal'
        }
    }
}