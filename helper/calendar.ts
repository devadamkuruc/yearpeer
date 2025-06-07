export const MONTHS: readonly string[] = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
] as const;

export const DAYS: readonly string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const getDaysInMonth = (month: number, year: number): number => {
    // Use UTC to avoid timezone issues
    return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
};

const getFirstDayOfMonth = (month: number, year: number): number => {
    // Use UTC to avoid timezone issues
    return new Date(Date.UTC(year, month, 1)).getUTCDay();
};

export const generateCalendarDays = (month: number, year: number): (number | null)[] => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);

    const days: (number | null)[] = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
    }

    return days;
};

export function formatDateForInput(date: Date) {
    return date.toISOString().split('T')[0]
}
