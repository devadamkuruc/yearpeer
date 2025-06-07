"use client"

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import React, { forwardRef, useState, useEffect } from 'react'

interface ColorOption {
    value: string
    label: string
    color: string
}

const colorOptions: ColorOption[] = [
    { value: '#BF76DE', label: 'Pink', color: '#BF76DE' },
    { value: '#888FFF', label: 'Purple', color: '#888FFF' },
    { value: '#E9BA9A', label: 'Brown', color: '#E9BA9A' },
    { value: '#E78888', label: 'Orange', color: '#E78888' },
    { value: '#88FFAA', label: 'Green', color: '#88FFAA' },
    { value: '#FFD700', label: 'Gold', color: '#FFD700' },
]

interface ColorSelectProps {
    name?: string
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export const ColorSelect = forwardRef(function ColorSelect(
    {
        name,
        value,
        onChange,
        placeholder = "Select a color",
        disabled = false,
        className,
        ...props
    }: ColorSelectProps,
    ref: React.ForwardedRef<HTMLButtonElement>
) {
    const [selected, setSelected] = useState<ColorOption | null>(
        value ? colorOptions.find(option => option.value === value) || null : null
    )

    // ✅ ADD THIS: Sync internal state when value prop changes
    useEffect(() => {
        if (value) {
            const option = colorOptions.find(option => option.value === value)
            setSelected(option || null)
        } else {
            setSelected(null)
        }
    }, [value])

    const handleChange = (option: ColorOption) => {
        setSelected(option)
        onChange?.(option.value)
    }

    return (
        <span
            data-slot="control"
            className={clsx([
                className,
                // Basic layout - matches your Select component exactly
                'group relative block w-full',
                // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
                'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-shadow-sm',
                // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
                'dark:before:hidden',
                // Focus ring
                'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset has-data-open:after:ring-2 has-data-open:after:ring-blue-500',
                // Disabled state
                'has-data-disabled:opacity-50 has-data-disabled:before:bg-zinc-950/5 has-data-disabled:before:shadow-none',
            ])}
        >
            <Headless.Listbox value={selected} onChange={handleChange} disabled={disabled}>
                <Headless.ListboxButton
                    ref={ref}
                    className={clsx([
                        // Basic layout - matches your Select exactly
                        'relative block w-full appearance-none rounded-lg py-[calc(--spacing(2.5)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
                        // Horizontal padding - matches your Select
                        'pr-[calc(--spacing(10)-1px)] pl-[calc(--spacing(3.5)-1px)] sm:pr-[calc(--spacing(9)-1px)] sm:pl-[calc(--spacing(3)-1px)]',
                        // Typography - matches your Select
                        'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
                        // Border - matches your Select
                        'border border-zinc-950/10 data-hover:border-zinc-950/20 dark:border-white/10 dark:data-hover:border-white/20',
                        // Background color - matches your Select
                        'bg-transparent dark:bg-white/5',
                        // Hide default focus styles
                        'focus:outline-hidden',
                        // Invalid state - matches your Select
                        'data-invalid:border-red-500 data-invalid:data-hover:border-red-500 dark:data-invalid:border-red-600 dark:data-invalid:data-hover:border-red-600',
                        // Disabled state - matches your Select
                        'data-disabled:border-zinc-950/20 data-disabled:opacity-100 dark:data-disabled:border-white/15 dark:data-disabled:bg-white/2.5 dark:data-hover:data-disabled:border-white/15',
                    ])}
                >
                    <div className="flex items-center gap-3">
                        {selected ? (
                            <>
                                <div
                                    className="h-4 w-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: selected.color }}
                                />
                                <span className="block truncate text-left">
                                    {selected.label}
                                </span>
                            </>
                        ) : (
                            <span className="block truncate text-left text-zinc-500 dark:text-zinc-400">
                                {placeholder}
                            </span>
                        )}
                    </div>
                </Headless.ListboxButton>

                {/* Dropdown arrow - matches your Select exactly */}
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <svg
                        className="size-5 stroke-zinc-500 group-has-data-disabled:stroke-zinc-600 sm:size-4 dark:stroke-zinc-400 forced-colors:stroke-[CanvasText]"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                        fill="none"
                    >
                        <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>

                <Headless.ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm dark:bg-zinc-800 dark:ring-white/10">
                    {colorOptions.map((option) => (
                        <Headless.ListboxOption
                            key={option.value}
                            value={option}
                            className="group relative cursor-default select-none py-2 pl-3 pr-9 text-zinc-950 data-focus:bg-zinc-950/20 data-focus:text-white dark:text-white"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="h-4 w-4 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: option.color }}
                                />
                                <span className="block truncate font-normal group-data-selected:font-semibold">
                                    {option.label}
                                </span>
                            </div>

                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 group-data-focus:text-white [.group:not([data-selected])_&]:hidden">
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </Headless.ListboxOption>
                    ))}
                </Headless.ListboxOptions>
            </Headless.Listbox>

            {/* Hidden input for form submission */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={selected?.value || ''}
                />
            )}
        </span>
    )
})