import YearCalendar from "@/components/layout/year-calendar";
import {getUserGoals} from "@/lib/actions/goals";
import {Goal} from "@/app/generated/prisma";

export default async function YearPage({params}: {params: Promise<{year:number}>}) {
    const {year} = await params;

    const goalsResult = await getUserGoals();
    const goals: Goal[] = goalsResult.success ? (goalsResult.goals || []) : [];

    return (
        <div className="flex justify-center items-center w-full p-6">
            <YearCalendar
                year={year}
                goals={goals}
            />
        </div>
    )
}