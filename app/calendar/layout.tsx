import CalendarSidebar from "@/components/layout/calendar-sidebar";

export default function CalendarLayout({
                                           children,
                                       }: Readonly<{
    children: React.ReactNode
}>) {

    return (
        <div className="flex min-h-screen">
            <CalendarSidebar/>

            <div className="flex-1 bg-zinc-900 ring-1 ring-white/10 rounded-xl my-2 ml-[21%] mr-2">
                {children}
            </div>
        </div>
    )
}