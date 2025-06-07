"use client"

import {DAYS, generateCalendarDays, MONTHS} from "@/helper/calendar";

interface MonthCalendarProps {
    month: number;
    year: number;
}

export default function MonthCalendar({ month, year}: MonthCalendarProps) {
    const days = generateCalendarDays(month, year);

    return (
        <div>
            <div className="flex w-full justify-center mb-2">{MONTHS[month]}</div>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-x-3 mb-1">
                {DAYS.map((day: string) => (
                    <div key={day} className="text-center text-xs font-medium text-zinc-400 py-1">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-x-3 gap-y-1">
                {days.map((day: number | null, index: number) => (
                    <div
                        key={index}
                        className={`
              aspect-square flex items-center justify-center text-sm
              ${day ? 'hover:bg-blue-50 hover:text-zinc-900 cursor-pointer rounded transition-colors' : ''}
              ${day ? 'text-white' : ''}
            `}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    )

}