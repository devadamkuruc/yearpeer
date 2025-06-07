'use client'

import {DAYS, generateCalendarDays, MONTHS} from "@/helper/calendar";
import {Goal} from "@/app/generated/prisma";

interface MonthCalendarProps {
    month: number;
    year: number;
    goals: Goal[];
    selectedStartDate?: Date | null;
    selectedEndDate?: Date | null;
    onDateClick?: (date: Date) => void;
}

export default function MonthCalendar({
                                          month,
                                          year,
                                          goals,
                                          selectedStartDate,
                                          selectedEndDate,
                                          onDateClick
                                      }: MonthCalendarProps) {
    const days = generateCalendarDays(month, year);

    // Helper function to check if a goal spans a specific date
    const isGoalOnDate = (goal: Goal, date: Date): boolean => {
        const goalStart = new Date(goal.startDate);
        const goalEnd = new Date(goal.endDate);

        // Set times to beginning/end of day to handle date comparisons properly
        goalStart.setHours(0, 0, 0, 0);
        goalEnd.setHours(23, 59, 59, 999);
        date.setHours(12, 0, 0, 0); // Noon to avoid timezone issues

        return date >= goalStart && date <= goalEnd;
    };

    // Get goals for a specific day
    const getGoalsForDay = (day: number): Goal[] => {
        if (!day) return [];

        const date = new Date(year, month, day);
        return goals.filter(goal => isGoalOnDate(goal, date));
    };

    // Get the background color for a day based on goals
    const getDayBackgroundColor = (day: number): string => {
        if (!day) return '';

        const dayGoals = getGoalsForDay(day);
        if (dayGoals.length === 0) return '';

        // If multiple goals, use the first goal's color
        // You could also blend colors or show the most recent goal
        return dayGoals[0].color || '#888FFF';
    };

    // Get goals count for display
    const getGoalsCount = (day: number): number => {
        if (!day) return 0;
        return getGoalsForDay(day).length;
    };

    // Get today's date for highlighting
    const today = new Date();
    const isToday = (day: number): boolean => {
        if (!day) return false;
        return today.getFullYear() == year &&
            today.getMonth() == month &&
            today.getDate() == day;
    };

    // Helper function to check if a date is in the selected range
    const isDateInRange = (day: number): boolean => {
        if (!day || !selectedStartDate || !selectedEndDate) return false;

        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0);

        const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0, 0);

        const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 0, 0, 0, 0);

        return currentDate >= startDate && currentDate <= endDate;
    };

    // Helper function to check if a date is the start or end of selection
    const isSelectedDate = (day: number): 'start' | 'end' | null => {
        if (!day) return null;

        const currentDate = new Date(year, month, day);
        currentDate.setHours(0, 0, 0, 0); // Set to midnight

        if (selectedStartDate) {
            const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0, 0);

            if (currentDate.getTime() === startDate.getTime()) {
                return 'start';
            }
        }

        if (selectedEndDate) {
            const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 0, 0, 0, 0);

            if (currentDate.getTime() === endDate.getTime()) {
                return 'end';
            }
        }

        return null;
    }

    // Handle day click
    const handleDayClick = (day: number) => {
        if (!day || !onDateClick) return;

        const clickedDate = new Date(year, month, day);
        onDateClick(clickedDate);
    };

    return (
        <div>
            <div className="flex w-full justify-center mb-2 font-medium text-zinc-200">
                {MONTHS[month]}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAYS.map((day: string) => (
                    <div key={day} className="text-center text-xs font-medium text-zinc-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day: number | null, index: number) => {
                    const backgroundColor = day ? getDayBackgroundColor(day) : '';
                    const goalsCount = day ? getGoalsCount(day) : 0;
                    const todayClass = day && isToday(day);
                    const hasGoals = backgroundColor !== '';
                    const inRange = day ? isDateInRange(day) : false;
                    const selectedType = day ? isSelectedDate(day) : null;

                    return (
                        <div
                            key={index}
                            onClick={() => day && handleDayClick(day)}
                            className={`
                                aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all
                                ${day ? 'cursor-pointer' : ''}
                                ${todayClass && day ? 'bg-white/5!' : ''}
                                ${!hasGoals && day ? 'hover:bg-white/10!' : ''}
                                ${!day ? '' : hasGoals ? 'text-white font-medium shadow-lg' : 'text-zinc-200'}
                                ${inRange && !hasGoals ? 'bg-zinc-500/30 text-white' : ''}
                                ${selectedType === 'start' ? 'ring-2 ring-zinc-400' : ''}
                                ${selectedType === 'end' ? 'ring-2 ring-zinc-400' : ''}
                            `}
                            style={{
                                backgroundColor: hasGoals ? backgroundColor : (inRange && !hasGoals ? undefined : 'transparent')
                            }}
                            title={
                                day && selectedType ?
                                    `${selectedType === 'start' ? 'Start' : 'End'} date: ${MONTHS[month]} ${day}` :
                                    day && goalsCount > 0 ?
                                        `${goalsCount} goal${goalsCount > 1 ? 's' : ''} on ${MONTHS[month]} ${day}` :
                                        undefined
                            }
                        >
                            {/* Day number */}
                            {day && (
                                <span className={`text-sm ${todayClass ? 'font-bold' : ''}`}>
                                    {day}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}