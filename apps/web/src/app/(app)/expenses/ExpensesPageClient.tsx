
"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, CalendarIcon, Receipt } from "lucide-react";
import type { Expense, ExpenseCategory } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getExpenses, addExpense, updateExpense, deleteExpense, type ExpenseFormInput } from "@/lib/actions/expenses";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from 'firebase/auth';

const categoryStyles: { [key in ExpenseCategory]: string } = {
  Seeds: "bg-green-500/20 text-green-700",
  Fertilizer: "bg-yellow-500/20 text-yellow-700",
  Labor: "bg-blue-500/20 text-blue-700",
  Equipment: "bg-orange-500/20 text-orange-700",
  Other: "bg-gray-500/20 text-gray-700",
};

export default function ExpensesPageClient() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchExpenses() {
      if (user) {
        setIsLoading(true);
        const fetchedExpenses = await getExpenses(user.uid);
        setExpenses(fetchedExpenses);
        setIsLoading(false);
      }
    }
    fetchExpenses();
  }, [user]);

  const summary = useMemo(() => {
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonthExpenses = expenses
      .filter(exp => new Date(exp.date).getMonth() === new Date().getMonth())
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryCounts = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as {[key in ExpenseCategory]: number});
    
    const topCategory = Object.keys(categoryCounts).length > 0 
      ? Object.entries(categoryCounts).sort((a,b) => b[1] - a[1])[0][0] as ExpenseCategory
      : null;

    return { totalExpenses, thisMonthExpenses, topCategory };
  }, [expenses]);

  const handleAddNew = () => {
    setEditingExpense(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = async (expenseId: string) => {
    if (!user) return;
    const result = await deleteExpense(user.uid, expenseId);
    if (result.success) {
      toast({ title: "Expense deleted successfully." });
      const fetchedExpenses = await getExpenses(user.uid);
      setExpenses(fetchedExpenses);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
  };

  const onFormSubmit = async () => {
    if (user) {
      const fetchedExpenses = await getExpenses(user.uid);
      setExpenses(fetchedExpenses);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="hidden md:block">
            <h1 className="text-3xl font-bold">Expense Tracking</h1>
            <p className="text-muted-foreground">
              Track and manage all your farming expenses.
            </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> Add New Expense
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Total Expenses</CardDescription>
                <CardTitle className="text-4xl">
                  {isLoading ? <Skeleton className="h-8 w-3/4" /> : `₹${summary.totalExpenses.toLocaleString()}` }
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">{expenses.length} expenses recorded</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>This Month</CardDescription>
                <CardTitle className="text-4xl">
                  {isLoading ? <Skeleton className="h-8 w-3/4" /> : `₹${summary.thisMonthExpenses.toLocaleString()}` }
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">Current month spending</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Top Category</CardDescription>
                <CardTitle className="text-4xl">
                   {isLoading ? <Skeleton className="h-8 w-1/2" /> : summary.topCategory ? summary.topCategory : 'N/A' }
                </CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="text-xs text-muted-foreground">Highest spending category</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            A list of your most recent expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    Array.from({length: 5}).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-[90px]" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-5 w-[60px] float-right" /></TableCell>
                            <TableCell className="text-right space-x-1"><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-8 inline-block" /></TableCell>
                        </TableRow>
                    ))
                ) : expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("border-transparent", categoryStyles[expense.category])}
                        >
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(expense.date, "dd MMM, yyyy")}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ₹{expense.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(expense)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt className="h-12 w-12 text-muted-foreground" />
                        <h3 className="font-semibold">No expenses recorded yet</h3>
                        <p className="text-muted-foreground text-sm">Click "Add New Expense" to start tracking.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ExpenseFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
        user={user}
        onFormSubmit={onFormSubmit}
      />
    </div>
  );
}

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  expense: Expense | null;
  user: User | null;
  onFormSubmit: () => void;
}

function ExpenseFormDialog({
  isOpen,
  onOpenChange,
  expense,
  user,
  onFormSubmit,
}: ExpenseFormDialogProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("Other");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setName(expense?.name || "");
      setCategory(expense?.category || "Other");
      setAmount(expense?.amount.toString() || "");
      setDate(expense?.date ? new Date(expense.date) : new Date());
      setNotes(expense?.notes || "");
    }
  }, [isOpen, expense]);

  const handleSubmit = async () => {
    if(!name || !amount || !date) {
        toast({ variant: "destructive", title: "Error", description: "Please fill all required fields." });
        return;
    };
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to perform this action."});
        return;
    }
    
    setIsSubmitting(true);

    const expenseData: ExpenseFormInput = {
        name,
        category,
        amount: parseFloat(amount),
        date: date.toISOString(),
        notes,
    };

    const result = expense?.id 
        ? await updateExpense(user.uid, expense.id, expenseData) 
        : await addExpense(user.uid, expenseData);

    if (result.success) {
        toast({ title: `Expense ${expense ? "updated" : "added"} successfully.` });
        onOpenChange(false);
        onFormSubmit();
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }

    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            {expense
              ? "Update the details for your expense."
              : "Fill in the details for your new expense."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g. Urea fertilizer"
              disabled={isSubmitting}
            />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount (₹)
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="e.g. 1500"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={(v) => setCategory(v as ExpenseCategory)} value={category} disabled={isSubmitting}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Seeds">Seeds</SelectItem>
                <SelectItem value="Fertilizer">Fertilizer</SelectItem>
                <SelectItem value="Labor">Labor</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Any additional notes..."
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
