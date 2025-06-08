import { Goal } from "@/app/generated/prisma"

// Checks if a goal spans a specific date
export const isGoalActiveOnDate = (goal: Goal, date: Date): boolean => {
    const goalStart = new Date(goal.startDate)
    const goalEnd = new Date(goal.endDate)

    // Set times to beginning/end of day to handle date comparisons properly
    goalStart.setHours(0, 0, 0, 0)
    goalEnd.setHours(23, 59, 59, 999)
    date.setHours(12, 0, 0, 0) // Noon to avoid timezone issues

    return date >= goalStart && date <= goalEnd
}

// Gets all goals active on a specific date
export const getGoalsForDate = (goals: Goal[], date: Date): Goal[] => {
    return goals.filter(goal => isGoalActiveOnDate(goal, date))
}

// Gets goals active on a specific day of a month
// Convenience function for calendar day rendering
export const getGoalsForDay = (goals: Goal[], day: number, month: number, year: number): Goal[] => {
    if (!day) return []

    const date = new Date(year, month, day)
    return getGoalsForDate(goals, date)
}

// Gets the background color for a day based on active goals
export const getDayBackgroundColor = (goals: Goal[]): string => {
    if (goals.length === 0) return ''

    // If multiple goals, use the first goal's color
    // You could also blend colors or show the most recent goal
    return goals[0].color || '#888FFF'
}

// Gets the count of goals active on a specific day
export const getGoalsCount = (goals: Goal[]): number => {
    return goals.length
}

// Gets the status of a goal relative to current date

export const getGoalStatus = (goal: Goal): 'upcoming' | 'active' | 'completed' => {
    const now = new Date()
    const startDate = new Date(goal.startDate)
    const endDate = new Date(goal.endDate)

    if (now < startDate) return 'upcoming'
    if (now > endDate) return 'completed'
    return 'active'
}