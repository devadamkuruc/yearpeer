"use client";

import React, { useState, useEffect } from 'react';
import useGoalStore from '@/store/goal-store';
import useTaskStore from '@/store/task-store';
import CalendarSidebar from "@/components/calendar/calendar-sidebar";
import YearView from "@/components/calendar/year-view";
import MonthView from "@/components/calendar/month-view";
import MonthTabs from "@/components/calendar/month-tabs";
import GoalModal from "@/components/calendar/goal-modal";
import TaskModal from "@/components/calendar/task-modal";
import { CalendarView } from '@/types';
import Link from "next/link";
import YearPicker from "@/components/calendar/year-picker";
import Image from "next/image";
import { GoalWithTasks } from '@/data/goals';
import { DayTasks } from '@/data/tasks';
import {Button} from "@/components/ui/button";

interface CalendarContentProps {
    initialGoals: GoalWithTasks[];
    initialTasks: DayTasks;
    initialYear: number;
}

export function CalendarContent({ initialGoals, initialTasks, initialYear }: CalendarContentProps) {
    // Initialize stores with initial data
    const {
        goals, setGoals, currentYear, setCurrentYear, isLoading,
        fetchGoals, modal, openModal, openEditModal, closeModal
    } = useGoalStore();

    const {
        tasks, modal: taskModal, openTaskModal, closeTaskModal,
        getTasksForDate, fetchTasksForMonth
    } = useTaskStore();

    // Initialize local state for view
    const [currentMonth, setCurrentMonth] = useState(-1); // -1 represents year view
    const [view, setView] = useState<CalendarView>('year');

    // Set initial data
    useEffect(() => {
        setGoals(initialGoals);
        // No need to set tasks here as they'll be fetched when needed
    }, [initialGoals, setGoals]);

    // Fetch goals when year changes
    useEffect(() => {
        if (currentYear !== initialYear) {
            fetchGoals(currentYear);
        }
    }, [currentYear, fetchGoals, initialYear]);

    // Fetch tasks for the selected month
    useEffect(() => {
        if (view === 'month' && currentMonth >= 0) {
            fetchTasksForMonth(currentYear, currentMonth);
        }
    }, [view, currentMonth, currentYear, fetchTasksForMonth]);

    const handleYearChange = (year: number) => {
        setCurrentYear(year);
    };

    const handleViewChange = (newView: CalendarView, month?: number) => {
        setView(newView);
        setCurrentMonth(month ?? -1);
    };

    const selectDateRange = (range: { start: Date | null, end: Date | null }) => {
        if (range.start && range.end) {
            openModal(range);
        }
    };

    return (
        <div className="flex h-screen bg-[#E5E5E5]">
            <div className="flex-1 overflow-auto flex flex-col">
                <div className="flex-1">
                    <div className="flex flex-col w-full h-screen justify-between p-4">
                        <div className="flex w-full justify-between">
                            <Button className="border-none outline-none shadow-none bg-transparent cursor-pointer hover:bg-transparent" onClick={() => handleViewChange('year')}>
                                <Image src="/yearpeer-logo.svg" alt="YearPeer" width={120} height={27} />
                            </Button>

                            <YearPicker
                                year={currentYear}
                                onYearChange={handleYearChange}
                            />
                        </div>

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="loading loading-spinner loading-lg text-primary"></div>
                            </div>
                        ) : (
                            view === 'year' ? (
                                <YearView
                                    currentYear={currentYear}
                                    goals={goals}
                                    onRangeSelected={selectDateRange}
                                    onYearChange={handleYearChange}
                                    onGoalClick={openEditModal}
                                    onMonthClick={handleViewChange}
                                />
                            ) : (
                                <MonthView
                                    year={currentYear}
                                    month={currentMonth}
                                    goals={goals}
                                    tasks={tasks}
                                    getTasksForDate={getTasksForDate}
                                    onDateClick={openTaskModal}
                                />
                            )
                        )}
                    </div>
                </div>
            </div>

            <CalendarSidebar
                onCreateNewGoal={() => openModal()}
                onEditGoal={openEditModal}
                goals={goals}
                currentYear={currentYear}
            />

            <GoalModal
                isOpen={modal.showModal}
                onClose={closeModal}
                initialDateRange={modal.selectedRange}
                editingGoal={modal.editingGoal}
            />

            <TaskModal
                isOpen={taskModal.showModal}
                onClose={closeTaskModal}
                date={taskModal.selectedDate}
            />
        </div>
    );
}