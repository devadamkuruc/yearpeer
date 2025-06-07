'use client'

import {Button} from "@/components/ui/button";
import {Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {useState, useTransition, useEffect} from "react";
import {Field, Label} from "@/components/ui/fieldset";
import {Input} from "@/components/ui/input";
import {updateGoal, deleteGoal} from "@/lib/actions/goals";
import {ColorSelect} from "@/components/ui/color-select";
import {Goal} from "@/app/generated/prisma";
import {formatDateForInput} from "@/helper/calendar";
import {DatePicker} from "@/components/ui/date-picker";

interface EditGoalDialogProps {
    goal: Goal | null
    isOpen: boolean
    onClose: () => void
}

export default function EditGoalDialog({ goal, isOpen, onClose }: EditGoalDialogProps) {
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)

    // Form state - we manage the form values locally
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Reset form when goal changes or dialog opens
    useEffect(() => {
        if (goal && isOpen) {
            setTitle(goal.title)
            setDescription(goal.description || '')
            setColor(goal.color)
            setStartDate(formatDateForInput(goal.startDate))
            setEndDate(formatDateForInput(goal.endDate))
            setError('')
            setIsDeleting(false)
        }
    }, [goal, isOpen])

    const handleSubmit = async (formData: FormData) => {
        if (!goal) return

        setError('')

        startTransition(async () => {
            // Create FormData with the goal ID and form values
            const updatedFormData = new FormData()
            updatedFormData.append('id', goal.id.toString())
            updatedFormData.append('title', formData.get('title') as string)
            updatedFormData.append('description', formData.get('description') as string)
            updatedFormData.append('color', formData.get('color') as string)
            updatedFormData.append('startDate', formData.get('startDate') as string)
            updatedFormData.append('endDate', formData.get('endDate') as string)

            const result = await updateGoal(updatedFormData)

            if (result.success) {
                onClose()
            } else {
                setError(result.error || 'An unknown error occurred')
            }
        })
    }

    const handleDelete = async () => {
        if (!goal) return

        setError('')
        setIsDeleting(true)

        startTransition(async () => {
            const result = await deleteGoal(goal.id)

            if (result.success) {
                onClose()
                console.log('Goal deleted successfully')
            } else {
                setError(result.error || 'Failed to delete goal')
                setIsDeleting(false)
            }
        })
    }

    const handleClose = () => {
        if (!isPending) {
            onClose()
        }
    }

    // Don't render if no goal is selected
    if (!goal) return null

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
                Update your goal details or delete it permanently.
            </DialogDescription>
            <form action={handleSubmit}>
                <DialogBody className="flex flex-col gap-4">
                    {error && (
                        <div
                            className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            {error}
                        </div>
                    )}
                    <Field>
                        <Label>Title</Label>
                        <Input
                            name="title"
                            placeholder="Title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isPending}
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
                            disabled={isPending}
                        />
                    </Field>
                    <Field>
                        <Label>Color</Label>
                        <ColorSelect
                            name="color"
                            placeholder="Choose a goal color"
                            value={color}
                            onChange={setColor}
                            disabled={isPending}
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
                                disabled={isPending}
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
                                minDate={startDate || undefined} // End date can't be before start date
                                disabled={isPending}
                                required
                            />
                        </Field>
                    </div>
                </DialogBody>
                <DialogActions>
                    <div className="flex justify-between w-full!">
                        {/* Delete button on the left */}
                        <Button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="bg-red-800! hover:bg-red-900! text-white "
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Goal'}
                        </Button>

                        {/* Cancel and Save buttons on the right */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                plain
                                onClick={handleClose}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !title.trim()}
                                className='bg-white/10!'
                            >
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </DialogActions>
            </form>
        </Dialog>
    )
}