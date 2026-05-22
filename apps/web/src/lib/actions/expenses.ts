
'use client';

import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Expense } from '@/types';

export type ExpenseFormInput = Omit<Expense, 'id' | 'date'> & {
    date: string;
};

const docToExpense = (doc: any): Expense => {
    const data = doc.data();
    return {
        id: doc.id,
        name: data.name,
        category: data.category,
        amount: data.amount,
        notes: data.notes,
        date: (data.date as Timestamp).toDate(),
    };
};

const getExpensesCollection = (userId: string) => {
    return collection(db, 'users', userId, 'expenses');
}

export async function getExpenses(userId: string): Promise<Expense[]> {
    if (!userId) return [];
    try {
        const expensesCollection = getExpensesCollection(userId);
        const q = query(expensesCollection, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docToExpense);
    } catch (error) {
        console.error("Error fetching expenses: ", error);
        return [];
    }
}

export async function addExpense(userId: string, data: ExpenseFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const dataToSave = {
            ...data,
            date: Timestamp.fromDate(new Date(data.date)),
        };
        const expensesCollection = getExpensesCollection(userId);
        await addDoc(expensesCollection, dataToSave);
        return { success: true };
    } catch (error) {
        console.error("Error adding expense: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to add expense. Details: ${errorMessage}` };
    }
}

export async function updateExpense(userId: string, id: string, data: ExpenseFormInput) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const expenseRef = doc(db, 'users', userId, 'expenses', id);
        const dataToUpdate = {
            ...data,
            date: Timestamp.fromDate(new Date(data.date))
        };
        await updateDoc(expenseRef, dataToUpdate);
        return { success: true };
    } catch (error) {
        console.error("Error updating expense: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to update expense. Details: ${errorMessage}` };
    }
}

export async function deleteExpense(userId: string, id: string) {
    if (!userId) return { success: false, error: 'User not authenticated.' };
    try {
        const expenseRef = doc(db, 'users', userId, 'expenses', id);
        await deleteDoc(expenseRef);
        return { success: true };
    } catch (error) {
        console.error("Error deleting expense: ", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, error: `Failed to delete expense. Details: ${errorMessage}` };
    }
}
