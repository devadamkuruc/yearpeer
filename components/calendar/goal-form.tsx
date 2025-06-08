// components/GoalForm.tsx

'use client'

import { useState, useEffect } from "react"
import { Field, Label } from "@/components/ui/fieldset"
import { Input } from "@/components/ui/input"
import { ColorSelect } from "@/components/ui/color-select"
import { DatePicker } from "@/components/ui/date-picker"
import { Goal } from "@/app/generated/prisma"
import { formatDateForInput } from "@/lib/utils/date"

export interface GoalFormData {
    title: string
    description: string
    color: string
    startDate: string
    endDate: string
}

interface GoalFormProps {
    initialData?: Goal | null
    prefilledStartDate?: Date | null
    prefilledEndDate?: Date | null
    disabled?: boolean
    onDataChange?: (data: GoalFormData) => void
}

export default function GoalForm({
                                     initialData,
                                     prefilledStartDate,
                                     prefilledEndDate,
                                     disabled = false,
                                     onDataChange
                                 }: GoalFormProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Helper function for date formatting
    const formatDateForPicker = (date: Date): string => {
        return date.toISOString().split('T')[0]
    }

    // Initialize form data
    useEffect(() => {
        if (initialData) {
            // Edit mode - populate with existing goal data
            setTitle(initialData.title)
            setDescription(initialData.description || '')
            setColor(initialData.color)
            setStartDate(formatDateForInput(initialData.startDate))
            setEndDate(formatDateForInput(initialData.endDate))
        } else if (prefilledStartDate && prefilledEndDate) {
            // Create mode with prefilled dates from calendar selection
            setStartDate(formatDateForPicker(prefilledStartDate))
            setEndDate(formatDateForPicker(prefilledEndDate))
        } else if (!startDate && !endDate) {
            // Create mode with default dates
            const today = new Date()
            const defaultEndDate = new Date()
            defaultEndDate.setDate(today.getDate() + 30)

            setStartDate(formatDateForPicker(today))
            setEndDate(formatDateForPicker(defaultEndDate))
        }
    }, [initialData, prefilledStartDate, prefilledEndDate])

    // Notify parent component of data changes
    useEffect(() => {
        if (onDataChange) {
            onDataChange({ title, description, color, startDate, endDate })
        }
    }, [title, description, color, startDate, endDate, onDataChange])

    return (
        <>
            <Field>
                <Label>Title</Label>
                <Input
                    name="title"
                    placeholder="Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={disabled}
                    required
                />
            </Field>

            <Field>
                <Label>Description</Label>
                <Input
                    name="description"
                    placeholder="Description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={disabled}
                />
            </Field>

            <Field>
                <Label>Color</Label>
                <ColorSelect
                    name="color"
                    placeholder="Choose a goal color"
                    value={color}
                    onChange={setColor}
                    disabled={disabled}
                />
            </Field>

            <div className="grid grid-cols-2 gap-4">
                <Field>
                    <Label>Start Date</Label>
                    <DatePicker
                        name="startDate"
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Select start date"
                        maxDate={endDate || undefined}
                        disabled={disabled}
                        required
                    />
                </Field>

                <Field>
                    <Label>End Date</Label>
                    <DatePicker
                        name="endDate"
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="Select end date"
                        minDate={startDate || undefined}
                        disabled={disabled}
                        required
                    />
                </Field>
            </div>
        </>
    )
}