'use client'

import {Button} from "@/components/ui/button";
import {Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {useEffect, useState, useTransition} from "react";
import {Field, Label} from "@/components/ui/fieldset";
import {Input} from "@/components/ui/input";
import {PlusCircleIcon} from "@heroicons/react/16/solid";
import {createGoal} from "@/lib/actions/goals";
import {ColorSelect} from "@/components/ui/color-select";
import {DatePicker} from "@/components/ui/date-picker";

interface CreateGoalDialogProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
    prefilledStartDate?: Date | null;
    prefilledEndDate?: Date | null;
}

export default function CreateGoalDialog({
                                             isOpen: externalIsOpen,
                                             onClose: externalOnClose,
                                             onSuccess,
                                             prefilledStartDate,
                                             prefilledEndDate
                                         }: CreateGoalDialogProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [error, setError] = useState('')
    const [isPending, startTransition] = useTransition()

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalOnClose ? () => externalOnClose() : setInternalIsOpen;

    const today = new Date()
    const defaultEndDate = new Date()
    defaultEndDate.setDate(today.getDate() + 30)

    const formatDateForPicker = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Handle prefilled dates when dialog opens
    useEffect(() => {
        if (isOpen) {
            if (prefilledStartDate && prefilledEndDate) {
                // Use prefilled dates from calendar selection
                setStartDate(formatDateForPicker(prefilledStartDate));
                setEndDate(formatDateForPicker(prefilledEndDate));
            } else if (!startDate && !endDate) {
                // Set default dates only if no dates are set
                setStartDate(formatDateForPicker(today));
                setEndDate(formatDateForPicker(defaultEndDate));
            }
            setError('');
        }
    }, [isOpen, prefilledStartDate, prefilledEndDate]);

    const handleSubmit = async (formData: FormData) => {
        setError('')

        startTransition(async () => {
            const result = await createGoal(formData)

            if (result.success) {
                setIsOpen(false)
                setError('')

                if (onSuccess) {
                    onSuccess();
                }

                setTimeout(() => {
                    setStartDate('')
                    setEndDate('')
                }, 200)
            } else {
                setError(result.error || 'An unknown error occurred')
            }
        })
    }

    const handleClose = () => {
        if (!isPending) {
            setIsOpen(false)
            setError('')

            setTimeout(() => {
                setStartDate('')
                setEndDate('')
            }, 200)
        }
    }

    const handleOpenInternal = () => {
        setInternalIsOpen(true);
    };

    return (
        <>
            {/* Only show the button if not controlled externally */}
            {externalIsOpen === undefined && (
                <Button
                    type="button"
                    onClick={handleOpenInternal}
                    className="self-start h-8 bg-white/10! items-center text-xs! shadow-none mt-4"
                >
                    <PlusCircleIcon className="size-3.5!"/>
                    Create a new goal
                </Button>
            )}
            <Dialog open={isOpen} onClose={handleClose}>
                <DialogTitle>Create a new goal</DialogTitle>
                <DialogDescription>
                    To create a new goal, fill out the form below.
                </DialogDescription>
                <form action={handleSubmit}>
                    <DialogBody className="flex flex-col gap-4">
                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
                                {error}
                            </div>
                        )}
                        <Field>
                            <Label>Title</Label>
                            <Input name="title" placeholder="Title..."/>
                        </Field>
                        <Field>
                            <Label>Description</Label>
                            <Input name="description" placeholder="Description..."/>
                        </Field>
                        <Field>
                            <Label>Color</Label>
                            <ColorSelect
                                name="color"
                                placeholder="Choose a goal color"
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
                                    minDate={startDate || undefined}
                                    disabled={isPending}
                                    required
                                />
                            </Field>
                        </div>
                    </DialogBody>
                    <DialogActions>
                        <Button type="button"
                                plain
                                onClick={handleClose}
                                disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit"
                                disabled={isPending}
                                className="bg-white/10!">
                            {isPending ? 'Creating...' : 'Create Goal'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}