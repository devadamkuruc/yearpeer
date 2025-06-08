'use client'

import MonthCalendar from "@/components/calendar/month-calendar";
import {Goal} from "@/app/generated/prisma";
import CreateGoalDialog from "@/components/calendar/create-goal-dialog";
import {useState} from "react";

interface YearCalendarProps {
    year: number;
    goals: Goal[];
}

export default function YearCalendar({
                                         year,
                                         goals
                                     }: YearCalendarProps) {

    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [isSelectingRange, setIsSelectingRange] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const handleDateClick = (clickedDate: Date) => {
        // Ensure we're working with a clean date at noon to avoid timezone issues
        const cleanDate = new Date(
            clickedDate.getFullYear(),
            clickedDate.getMonth(),
            clickedDate.getDate(),
            12, 0, 0, 0  // Noon, local timezone
        );

        if (!isSelectingRange) {
            // Start new selection
            setSelectedStartDate(cleanDate);
            setSelectedEndDate(null);
            setIsSelectingRange(true);
        } else {
            // Complete the selection
            if (selectedStartDate && cleanDate >= selectedStartDate) {
                setSelectedEndDate(cleanDate);
                setIsSelectingRange(false);
                setShowCreateDialog(true);
            } else {
                // If clicked date is before start date, restart selection
                setSelectedStartDate(cleanDate);
                setSelectedEndDate(null);
            }
        }
    };

    const handleDialogClose = () => {
        setShowCreateDialog(false);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    const monthRows: readonly number[][] = [
        [0, 1, 2, 3],     // Jan, Feb, Mar, Apr
        [4, 5, 6, 7],     // May, Jun, Jul, Aug
        [8, 9, 10, 11]    // Sep, Oct, Nov, Dec
    ] as const;

    return (
        <>
            <div className="w-full space-y-3 space-x-5">
                {monthRows.map((row: readonly number[], rowIndex: number) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-14">
                        {row.map((monthIndex: number) => (
                            <MonthCalendar
                                key={monthIndex}
                                month={monthIndex}
                                year={year}
                                goals={goals}
                                selectedStartDate={selectedStartDate}
                                selectedEndDate={selectedEndDate}
                                onDateClick={handleDateClick}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <CreateGoalDialog
                isOpen={showCreateDialog}
                onClose={handleDialogClose}
                prefilledStartDate={selectedStartDate}
                prefilledEndDate={selectedEndDate}
            />
        </>
    );

}