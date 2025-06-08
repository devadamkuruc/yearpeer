/**
 * Centralized constants for the application
 */

export interface ColorOption {
    value: string
    label: string
    color: string
}

/**
 * Available color options for goals
 */
export const COLOR_OPTIONS: ColorOption[] = [
    { value: '#BF76DE', label: 'Pink', color: '#BF76DE' },
    { value: '#888FFF', label: 'Purple', color: '#888FFF' },
    { value: '#E9BA9A', label: 'Brown', color: '#E9BA9A' },
    { value: '#E78888', label: 'Orange', color: '#E78888' },
    { value: '#88FFAA', label: 'Green', color: '#88FFAA' },
    { value: '#FFD700', label: 'Gold', color: '#FFD700' },
] as const

/**
 * Calendar constants
 */
export const MONTHS: readonly string[] = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
] as const

export const DAYS: readonly string[] = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
] as const

/**
 * App configuration constants
 */
export const APP_CONFIG = {
    name: 'YearPeer',
    currentYear: new Date().getFullYear(),
    defaultCalendarYear: new Date().getFullYear(),
} as const

/**
 * Route constants
 */
export const ROUTES = {
    home: '/',
    signIn: '/sign-in',
    calendar: (year?: number) => `/calendar/${year || APP_CONFIG.currentYear}`,
    calendarMonth: (year: number, month: number) => `/calendar/${year}/${month}`,
    notes: (year?: number) => `/notes/${year || APP_CONFIG.currentYear}`,
    settings: '/settings',
} as const