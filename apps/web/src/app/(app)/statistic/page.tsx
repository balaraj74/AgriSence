
'use client';

import { redirect } from "next/navigation";

// The "Statistic" page is called "Analytics" in this version.
// Redirecting to the correct page to avoid 404s.
export default function StatisticRedirectPage() {
    redirect('/analytics');
    return null;
}
