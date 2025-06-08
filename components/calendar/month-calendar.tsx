'use client'

import {  generateCalendarDays } from "@/lib/utils/date"
import { Goal } from "@/app/generated/prisma"
import {DAYS, MONTHS} from "@/lib/constants";
import Day from "@/components/calendar/day";

interface MonthCalendarProps {
    month: number
    year: number
    goals: Goal[]
    selectedStartDate?: Date | null
    selectedEndDate?: Date | null
    onDateClick?: (date: Date) => void
}

export default function MonthCalendar({
                                          month,
                                          year,
                                          goals,
                                          selectedStartDate,
                                          selectedEndDate,
                                          onDateClick
                                      }: MonthCalendarProps) {
    const days = generateCalendarDays(month, year)

    return (
        <div>
            {/* Month header */}
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
                {days.map((day, index) => (
                    <Day
                        key={index}
                        day={day}
                        month={month}
                        year={year}
                        goals={goals}
                        selectedStartDate={selectedStartDate}
                        selectedEndDate={selectedEndDate}
                        onDateClick={onDateClick}
                    />
                ))}
            </div>
        </div>
    )
}