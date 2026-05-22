
'use client';

import { redirect } from "next/navigation";

// The "All Farms" page is not a primary navigation item in this version.
// Redirecting to the dashboard as a fallback.
export default function AllFarmsRedirectPage() {
    redirect('/dashboard');
    return null;
}
