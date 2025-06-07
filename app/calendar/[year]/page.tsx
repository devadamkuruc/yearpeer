import YearCalendar from "@/components/layout/year-calendar";

export default async function YearPage({params}: {params: Promise<{year:number}>}) {
    const {year} = await params;

    return (
        <div className="w-full p-6">
            <YearCalendar
                year={year}
            />
        </div>
    )
}