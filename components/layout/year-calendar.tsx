import MonthCalendar from "@/components/layout/month-calendar";

interface YearCalendarProps {
    year?: number;
}

export default function YearCalendar({
                                         year = new Date().getFullYear()
                                     }: YearCalendarProps) {
    const monthRows: readonly number[][] = [
        [0, 1, 2, 3],     // Jan, Feb, Mar, Apr
        [4, 5, 6, 7],     // May, Jun, Jul, Aug
        [8, 9, 10, 11]    // Sep, Oct, Nov, Dec
    ] as const;

    return (
        <div className="">

            {/* Calendar grid */}
            <div className="space-y-4 space-x-5">
                {monthRows.map((row: readonly number[], rowIndex: number) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8">
                        {row.map((monthIndex: number) => (
                            <MonthCalendar
                                key={monthIndex}
                                month={monthIndex}
                                year={year}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

}