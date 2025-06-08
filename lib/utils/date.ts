// lib/utils/date.ts - Updated with calendar generation

// Formats a Date object for HTML date input (YYYY-MM-DD)
export const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Formats a Date object for display (e.g., "Jan 15, 2024")
export const formatDateForDisplay = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}

// Creates a Date object from YYYY-MM-DD string format
export const createDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

// Creates a clean date at noon to avoid timezone issues
export const createCleanDate = (year: number, month: number, day: number): Date => {
    return new Date(year, month, day, 12, 0, 0, 0)
}

// Checks if a date is today
export const isToday = (date: Date): boolean => {
    const today = new Date()
    return today.getFullYear() === date.getFullYear() &&
        today.getMonth() === date.getMonth() &&
        today.getDate() === date.getDate()
}

// Checks if a date falls within a range (inclusive)
export const isDateInRange = (
    date: Date,
    startDate: Date | null,
    endDate: Date | null
): boolean => {
    if (!startDate || !endDate) return false

    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0)
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0)

    return currentDate >= start && currentDate <= end
}

// Checks if a date is the start or end of a selection
export const getSelectionType = (
    date: Date,
    selectedStartDate: Date | null,
    selectedEndDate: Date | null
): 'start' | 'end' | null => {
    if (!date) return null

    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)

    if (selectedStartDate) {
        const startDate = new Date(
            selectedStartDate.getFullYear(),
            selectedStartDate.getMonth(),
            selectedStartDate.getDate(),
            0, 0, 0, 0
        )
        if (currentDate.getTime() === startDate.getTime()) {
            return 'start'
        }
    }

    if (selectedEndDate) {
        const endDate = new Date(
            selectedEndDate.getFullYear(),
            selectedEndDate.getMonth(),
            selectedEndDate.getDate(),
            0, 0, 0, 0
        )
        if (currentDate.getTime() === endDate.getTime()) {
            return 'end'
        }
    }

    return null
}

// Compares two dates for equality (ignoring time)
export const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
}

// Gets the number of days in a month
const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate()
}

// Gets the first day of the week for a month (0 = Sunday, 6 = Saturday)
const getFirstDayOfMonth = (month: number, year: number): number => {
    return new Date(year, month, 1).getDay()
}

// Generates calendar days array for a given month/year
export const generateCalendarDays = (month: number, year: number): (number | null)[] => {
    const daysInMonth = getDaysInMonth(month, year)
    const firstDay = getFirstDayOfMonth(month, year)

    const days: (number | null)[] = []

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
        days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        days.push(day)
    }

    return days
}