'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef, useState, useEffect } from 'react'
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'

interface DatePickerProps {
    name?: string
    value?: string // YYYY-MM-DD format
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
    required?: boolean
    minDate?: string // YYYY-MM-DD format
    maxDate?: string // YYYY-MM-DD format
}

export const DatePicker = forwardRef(function DatePicker(
    {
        name,
        value,
        onChange,
        placeholder = "Select a date",
        disabled = false,
        className,
        required = false,
        minDate,
        maxDate,
        ...props
    }: DatePickerProps,
    ref: React.ForwardedRef<HTMLButtonElement>
) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? (() => {
            const [year, month, day] = value.split('-').map(Number)
            return new Date(year, month - 1, day)
        })() : null
    )
    const [currentMonth, setCurrentMonth] = useState(() => {
        if (value) {
            const [year, month] = value.split('-').map(Number)
            return new Date(year, month - 1, 1) // First day of selected month
        }
        return new Date() // Today's month as fallback
    })
    const [isOpen, setIsOpen] = useState(false)

    // Sync with external value changes
    useEffect(() => {
        if (value) {
            const [year, month, day] = value.split('-').map(Number)
            const newDate = new Date(year, month - 1, day)
            setSelectedDate(newDate)

            // 🎯 NEW: Update current month to show the selected date
            setCurrentMonth(new Date(year, month - 1, 1))
        } else {
            setSelectedDate(null)
            setCurrentMonth(new Date()) // Reset to current month when cleared
        }
    }, [value])

    const formatDateForDisplay = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    }

    const formatDateForInput = (date: Date) => {
        // Use local date methods to avoid timezone issues
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const handleDateSelect = (date: Date) => {
        // Don't allow selection of disabled dates
        if (isDateDisabled(date)) return

        // Create a new date using only the date components to avoid timezone issues
        const year = date.getFullYear()
        const month = date.getMonth()
        const day = date.getDate()
        const localDate = new Date(year, month, day)

        setSelectedDate(localDate)
        const formattedDate = formatDateForInput(localDate)
        onChange?.(formattedDate)
        setIsOpen(false)
    }

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
    }

    const isDateDisabled = (date: Date) => {
        const dateStr = formatDateForInput(date)

        if (minDate && dateStr < minDate) return true
        if (maxDate && dateStr > maxDate) return true

        return false
    }

    const isSelected = (date: Date) => {
        if (!selectedDate) return false
        return date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate()
    }

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    }

    const monthYear = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long'
    }).format(currentMonth)

    return (
        <span
            data-slot="control"
            className={clsx([
                className,
                'group relative block w-full',
                'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm',
                'dark:before:hidden',
                'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-open:after:ring-2 has-data-open:after:ring-blue-500',
                'has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none',
            ])}
        >
            <Headless.Popover>
                <Headless.PopoverButton
                    ref={ref}
                    disabled={disabled}
                    className={clsx([
                        'relative block w-full appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
                        'pr-[calc(--spacing(10)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pr-[calc(--spacing(9)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
                        'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
                        'border border-zinc-950/10 data-hover:border-zinc-950/20 data-open:border-blue-500 dark:border-white/10 dark:data-hover:border-white/20 dark:data-open:border-blue-500',
                        'bg-transparent dark:bg-white/5',
                        'focus:outline-hidden',
                        'data-disabled:border-zinc-950/20 data-disabled:opacity-100 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5',
                    ])}
                >
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        {selectedDate ? (
                            <span className="block truncate text-left">
                                {formatDateForDisplay(selectedDate)}
                            </span>
                        ) : (
                            <span className="block truncate text-left text-zinc-500 dark:text-zinc-400">
                                {placeholder}
                            </span>
                        )}
                    </div>
                </Headless.PopoverButton>

                <Headless.PopoverPanel className="absolute z-10 mt-1 w-full min-w-80 origin-top-left rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 focus:outline-none dark:bg-zinc-800 dark:ring-white/10">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={goToPreviousMonth}
                            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {monthYear}
                        </h3>
                        <button
                            type="button"
                            onClick={goToNextMonth}
                            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                            <div key={day} className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((date, index) => {
                            if (!date) {
                                return <div key={index} className="p-2" />
                            }

                            const isDisabled = isDateDisabled(date)

                            return (
                                <button
                                    key={date.toISOString()}
                                    type="button"
                                    onClick={() => handleDateSelect(date)}
                                    disabled={isDisabled}
                                    className={clsx([
                                        'p-2 text-sm rounded-md transition-colors',
                                        'focus:outline-none focus:ring-2 focus:ring-blue-500',
                                        isDisabled && 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed',
                                        !isDisabled && 'hover:bg-zinc-100 dark:hover:bg-zinc-700',
                                        isSelected(date) && !isDisabled && 'bg-blue-600 text-white hover:bg-blue-700',
                                        isToday(date) && !isSelected(date) && !isDisabled && 'bg-zinc-200 dark:bg-zinc-600',
                                        !isSelected(date) && !isToday(date) && !isDisabled && 'text-zinc-900 dark:text-zinc-100'
                                    ])}
                                >
                                    {date.getDate()}
                                </button>
                            )
                        })}
                    </div>
                </Headless.PopoverPanel>
            </Headless.Popover>

            {/* Hidden input for form submission */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={selectedDate ? formatDateForInput(selectedDate) : ''}
                    required={required}
                />
            )}
        </span>
    )
})