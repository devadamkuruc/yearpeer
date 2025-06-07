// middleware.ts
import {clerkMiddleware, createRouteMatcher} from '@clerk/nextjs/server';
import {NextResponse} from "next/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/api/webhooks(.*)'])

export default clerkMiddleware(
    async (auth, req) => {
        if (req.nextUrl.pathname === '/') {
            const { userId } = await auth();

            if (userId) {
                const currentYear = new Date().getFullYear();
                return NextResponse.redirect(new URL(`/calendar/${currentYear}`, req.url));
            } else {
                // Redirect unauthenticated users to sign-in
                return NextResponse.redirect(new URL('/sign-in', req.url));
            }
        }

        if (!isPublicRoute(req)) {
            await auth.protect()
        }
    }
);

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};
