
import HarvestPageClient from "./HarvestPageClient";

export default function HarvestPage() {
    return (
        <div>
            <div className="md:hidden">
                <h1 className="text-2xl font-bold">Harvest Records</h1>
                <p className="text-muted-foreground">
                    Record and track your crop yields and output.
                </p>
            </div>
            <HarvestPageClient />
        </div>
    );
}
