import { CalendarContent } from "@/components/calendar/calendar-content";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchGoalsByYear } from "@/actions/goals";
import { fetchTasksByDateRange } from "@/actions/tasks";
import { startOfYear, endOfYear } from "date-fns";

export default async function CalendarPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/sign-in");
    }

    const currentYear = new Date().getFullYear();

    // Fetch initial data
    const goals = await fetchGoalsByYear(currentYear);

    // Fetch tasks for the current year
    const startDate = startOfYear(new Date(currentYear, 0, 1));
    const endDate = endOfYear(new Date(currentYear, 0, 1));
    const tasks = await fetchTasksByDateRange(startDate, endDate);

    return (
        <CalendarContent initialGoals={goals} initialTasks={tasks} initialYear={currentYear} />
    );
}