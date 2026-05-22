
import CropsPageClient from "./CropsPageClient";

export const metadata = {
    title: "Crop Management - AgriSence",
};

export default function CropsPage() {
    return (
        <div>
            <div className="md:hidden">
                <h1 className="text-2xl font-bold">Crop Management</h1>
                <p className="text-muted-foreground">
                    Manage your crops and track their growth cycle.
                </p>
            </div>
            <CropsPageClient />
        </div>
    );
}
