// components/GoalDialog.tsx

'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Goal } from "@/app/generated/prisma"
import GoalForm, {GoalFormData} from "@/components/calendar/goal-form";

interface GoalDialogProps {
    // Dialog state
    isOpen: boolean
    onClose: () => void

    // Mode
    mode: 'create' | 'edit'

    // Data
    goal?: Goal | null
    prefilledStartDate?: Date | null
    prefilledEndDate?: Date | null

    // Actions
    onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>
    onDelete?: () => Promise<{ success: boolean; error?: string }>
    onSuccess?: () => void

    // UI customization
    submitText?: string
    title?: string
    description?: string
}

export default function GoalDialog({
                                       isOpen,
                                       onClose,
                                       mode,
                                       goal,
                                       prefilledStartDate,
                                       prefilledEndDate,
                                       onSubmit,
                                       onDelete,
                                       onSuccess,
                                       submitText,
                                       title,
                                       description
                                   }: GoalDialogProps) {
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()
    const [isDeleting, setIsDeleting] = useState(false)
    const [formData, setFormData] = useState<GoalFormData | null>(null)

    // Default titles and descriptions
    const dialogTitle = title || (mode === 'create' ? 'Create a new goal' : 'Edit Goal')
    const dialogDescription = description || (
        mode === 'create'
            ? 'To create a new goal, fill out the form below.'
            : 'Update your goal details or delete it permanently.'
    )
    const buttonText = submitText || (mode === 'create' ? 'Create Goal' : 'Save Changes')

    const handleSubmit = async (formDataFromForm: FormData) => {
        setError('')

        startTransition(async () => {
            const result = await onSubmit(formDataFromForm)

            if (result.success) {
                handleClose()
                if (onSuccess) {
                    onSuccess()
                }
            } else {
                setError(result.error || 'An unknown error occurred')
            }
        })
    }

    const handleDelete = async () => {
        if (!onDelete) return

        setError('')
        setIsDeleting(true)

        startTransition(async () => {
            const result = await onDelete()

            if (result.success) {
                handleClose()
            } else {
                setError(result.error || 'Failed to delete goal')
                setIsDeleting(false)
            }
        })
    }

    const handleClose = () => {
        if (!isPending) {
            onClose()
            setError('')
            setIsDeleting(false)

            // Small delay to allow dialog animation
            setTimeout(() => {
                setFormData(null)
            }, 200)
        }
    }

    // Check if form is valid for submission
    const isFormValid = formData?.title.trim() || false

    return (
        <Dialog open={isOpen} onClose={handleClose}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>

            <form action={handleSubmit}>
                <DialogBody className="flex flex-col gap-4">
                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200 dark:bg-red-900/20 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <GoalForm
                        initialData={goal}
                        prefilledStartDate={prefilledStartDate}
                        prefilledEndDate={prefilledEndDate}
                        disabled={isPending}
                        onDataChange={setFormData}
                    />
                </DialogBody>

                <DialogActions>
                    {mode === 'edit' && onDelete ? (
                        <div className="flex justify-between w-full!">
                            {/* Delete button on the left */}
                            <Button
                                type="button"
                                onClick={handleDelete}
                                disabled={isPending}
                                className="bg-red-800! hover:bg-red-900! text-white"
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
                                    disabled={isPending || !isFormValid}
                                    className="bg-white/10!"
                                >
                                    {isPending ? 'Saving...' : buttonText}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                disabled={isPending || !isFormValid}
                                className="bg-white/10!"
                            >
                                {isPending ? (mode === 'create' ? 'Creating...' : 'Saving...') : buttonText}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </form>
        </Dialog>
    )
}