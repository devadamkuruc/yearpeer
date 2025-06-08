'use client'

import { Goal } from "@/app/generated/prisma"
import { getDayBackgroundColor, getGoalsCount, getGoalsForDay } from "@/lib/utils/goals"
import { getSelectionType, isDateInRange, isToday } from "@/lib/utils/date"
import {MONTHS} from "@/lib/constants";

interface CalendarDayProps {
    day: number | null
    month: number
    year: number
    goals: Goal[]
    selectedStartDate?: Date | null
    selectedEndDate?: Date | null
    onDateClick?: (date: Date) => void
}

export default function Day({
                                        day,
                                        month,
                                        year,
                                        goals,
                                        selectedStartDate,
                                        selectedEndDate,
                                        onDateClick
                                    }: CalendarDayProps) {
    // Empty cell for spacing
    if (!day) {
        return <div className="aspect-square" />
    }

    const date = new Date(year, month, day)
    const dayGoals = getGoalsForDay(goals, day, month, year)
    const backgroundColor = getDayBackgroundColor(dayGoals)
    const goalsCount = getGoalsCount(dayGoals)
    const hasGoals = backgroundColor !== ''

    const todayClass = isToday(date)
    const inRange = isDateInRange(date, selectedStartDate || null, selectedEndDate || null)
    const selectedType = getSelectionType(date, selectedStartDate || null, selectedEndDate || null)

    const handleClick = () => {
        if (!onDateClick) return
        onDateClick(date)
    }

    const getTooltip = () => {
        if (selectedType) {
            return `${selectedType === 'start' ? 'Start' : 'End'} date: ${MONTHS[month]} ${day}`
        }
        if (goalsCount > 0) {
            return `${goalsCount} goal${goalsCount > 1 ? 's' : ''} on ${MONTHS[month]} ${day}`
        }
        return undefined
    }

    return (
        <div
            onClick={handleClick}
            className={`
                aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all cursor-pointer
                ${todayClass ? 'bg-white/5!' : ''}
                ${!hasGoals ? 'hover:bg-white/10!' : ''}
                ${hasGoals ? 'text-white font-medium shadow-lg' : 'text-zinc-200'}
                ${inRange && !hasGoals ? 'bg-zinc-500/30 text-white' : ''}
                ${selectedType === 'start' ? 'ring-2 ring-zinc-400' : ''}
                ${selectedType === 'end' ? 'ring-2 ring-zinc-400' : ''}
            `}
            style={{
                backgroundColor: hasGoals ? backgroundColor : (inRange && !hasGoals ? undefined : 'transparent')
            }}
            title={getTooltip()}
        >
            <span className={`text-sm ${todayClass ? 'font-bold' : ''}`}>
                {day}
            </span>
        </div>
    )
}