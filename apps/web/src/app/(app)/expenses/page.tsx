
import ExpensesPageClient from "./ExpensesPageClient";

export default function ExpensesPage() {
    return (
         <div>
            <div className="md:hidden">
                <h1 className="text-2xl font-bold">Expense Tracking</h1>
                <p className="text-muted-foreground">
                    Track and manage all your farming expenses.
                </p>
            </div>
            <ExpensesPageClient />
        </div>
    );
}
