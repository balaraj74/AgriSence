import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Receipt, Calendar } from 'lucide-react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { getExpenses, addExpense, updateExpense, deleteExpense } from '../../src/services/firestore';
import type { Expense, ExpenseCategory } from '../../src/types';

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Seeds: '#4ade80',
  Fertilizer: '#fbbf24',
  Labor: '#60a5fa',
  Equipment: '#f97316',
  Other: '#94a3b8',
};

// ── CUSTOM HOOK FOR FETCHING ───────────────────────────────────
function useExpensesData(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const data = await getExpenses(userId);
      setExpenses(data);
    } catch {
      Alert.alert('Error', 'Failed to load expenses.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);
  return { expenses, isLoading, isRefreshing, refetch: load, setExpenses };
}

// ── EXPENSE STATS SUBCOMPONENT ─────────────────────────────────
function ExpenseStats({ expenses, isLoading }: { expenses: Expense[]; isLoading: boolean }) {
  const { colors, spacing } = useTheme();
  const summary = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const thisMonth = expenses
      .filter((e) => new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((sum, e) => sum + e.amount, 0);
    const counts = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount;
      return acc;
    }, {} as Record<ExpenseCategory, number>);
    const top = Object.keys(counts).length > 0
      ? (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as ExpenseCategory)
      : 'N/A';
    return { total, thisMonth, top };
  }, [expenses]);

  return (
    <View style={{ gap: spacing[3], marginBottom: spacing[4] }}>
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Card style={{ flex: 1, backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[3] }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Total Expenses</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>
              {isLoading ? '...' : `₹${summary.total.toLocaleString()}`}
            </Text>
          </CardContent>
        </Card>
        <Card style={{ flex: 1, backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[3] }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>This Month</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>
              {isLoading ? '...' : `₹${summary.thisMonth.toLocaleString()}`}
            </Text>
          </CardContent>
        </Card>
      </View>
      <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <CardContent style={{ padding: spacing[3], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Top Spending Category</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 2 }}>{summary.top}</Text>
          </View>
          {summary.top !== 'N/A' && (
            <Badge
              label={summary.top}
              variant="outline"
              style={{
                borderColor: CATEGORY_COLORS[summary.top as ExpenseCategory],
                backgroundColor: `${CATEGORY_COLORS[summary.top as ExpenseCategory]}20`,
              }}
            />
          )}
        </CardContent>
      </Card>
    </View>
  );
}

// ── EXPENSE CHART SUBCOMPONENT ─────────────────────────────────
function ExpenseChart({ expenses }: { expenses: Expense[] }) {
  const { colors, spacing } = useTheme();
  const chartData = useMemo(() => {
    const sums: Record<string, number> = {};
    expenses.forEach((e) => { sums[e.category] = (sums[e.category] ?? 0) + e.amount; });
    const total = Object.values(sums).reduce((a, b) => a + b, 0);
    if (total === 0) return [];
    return Object.entries(sums).map(([cat, val]) => ({
      value: val,
      color: CATEGORY_COLORS[cat as ExpenseCategory] || '#ccc',
      text: `${Math.round((val / total) * 100)}%`,
    }));
  }, [expenses]);

  if (chartData.length === 0) return null;
  return (
    <Card style={{ backgroundColor: colors.card, borderColor: colors.border, marginBottom: spacing[4] }}>
      <CardContent style={{ padding: spacing[4], alignItems: 'center', gap: spacing[3] }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground, alignSelf: 'flex-start' }}>Category Breakdown</Text>
        <PieChart data={chartData} radius={70} textBackgroundRadius={15} showText textColor={colors.foreground} textSize={10} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], justifyContent: 'center', marginTop: spacing[2] }}>
          {Object.keys(CATEGORY_COLORS).map((cat) => (
            <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: CATEGORY_COLORS[cat as ExpenseCategory] }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{cat}</Text>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}

// ── EXPENSE ITEM SUBCOMPONENT ──────────────────────────────────
interface ExpenseItemProps {
  expense: Expense;
  onEdit: () => void;
  onDelete: () => void;
}
function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const { colors, spacing } = useTheme();
  const color = CATEGORY_COLORS[expense.category] || colors.mutedForeground;

  return (
    <Card style={{ backgroundColor: colors.card, borderColor: colors.border, marginBottom: spacing[3] }}>
      <CardContent style={{ padding: spacing[3], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>{expense.name}</Text>
            <Badge label={expense.category} variant="outline" style={{ borderColor: color, backgroundColor: `${color}20` }} />
          </View>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{format(expense.date, 'dd MMM, yyyy')}</Text>
          {expense.notes && <Text style={{ fontSize: 12, color: colors.mutedForeground, fontStyle: 'italic' }}>{expense.notes}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end', gap: spacing[2] }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground }}>₹{expense.amount.toLocaleString()}</Text>
          <View style={{ flexDirection: 'row', gap: spacing[1] }}>
            <TouchableOpacity onPress={onEdit} style={{ padding: 6 }}><Pencil size={14} color={colors.mutedForeground} /></TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}><Trash2 size={14} color={colors.destructive} /></TouchableOpacity>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

// ── FORM MODAL SUBCOMPONENT ────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  userId: string | undefined;
  onSaved: () => void;
}
function ExpenseFormModal({ isOpen, onClose, expense, userId, onSaved }: ModalProps) {
  const { colors, spacing } = useTheme();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Other');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(expense?.name ?? '');
      setAmount(expense?.amount ? expense.amount.toString() : '');
      setCategory(expense?.category ?? 'Other');
      setDateStr(expense?.date ? format(expense.date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setNotes(expense?.notes ?? '');
    }
  }, [isOpen, expense]);

  const handleSave = async () => {
    if (!userId) return;
    if (!name.trim() || !amount.trim()) {
      Alert.alert('Validation Error', 'Name and Amount are required.');
      return;
    }
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) {
      Alert.alert('Validation Error', 'Date must be YYYY-MM-DD format.');
      return;
    }
    setIsSaving(true);
    try {
      const data = { name, amount: parseFloat(amount), category, date: parsedDate, notes: notes || undefined };
      if (expense) {
        await updateExpense(userId, expense.id, data);
      } else {
        await addExpense(userId, data);
      }
      onSaved();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save expense.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing[4], maxHeight: '90%', borderColor: colors.border, borderTopWidth: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: spacing[4] }}>{expense ? 'Edit Expense' : 'Add New Expense'}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing[3], paddingBottom: spacing[6] }}>
            <Input label="Expense Name" placeholder="e.g. Fertilizer" value={name} onChangeText={setName} />
            <Input label="Amount (₹)" placeholder="e.g. 1500" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.foreground, marginTop: 4 }}>Category</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
              {(Object.keys(CATEGORY_COLORS) as ExpenseCategory[]).map((cat) => {
                const selected = category === cat;
                return (
                  <TouchableOpacity key={cat} onPress={() => setCategory(cat)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : 'transparent' }}>
                    <Text style={{ color: selected ? colors.background : colors.foreground, fontSize: 12, fontWeight: '600' }}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Input label="Date (YYYY-MM-DD)" placeholder="YYYY-MM-DD" value={dateStr} onChangeText={setDateStr} />
            <Input label="Notes" placeholder="Additional notes..." value={notes} onChangeText={setNotes} />
            <View style={{ flexDirection: 'row', gap: spacing[3], marginTop: spacing[4] }}>
              <Button label="Cancel" variant="outline" style={{ flex: 1 }} onPress={onClose} disabled={isSaving} />
              <Button label={isSaving ? 'Saving...' : 'Save'} variant="default" style={{ flex: 1 }} onPress={handleSave} disabled={isSaving} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── MAIN SCREEN COMPONENT ──────────────────────────────────────
export default function ExpensesScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { expenses, isLoading, isRefreshing, refetch, setExpenses } = useExpensesData(user?.uid);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenForm = (exp: Expense | null) => {
    setSelectedExpense(exp);
    setIsModalOpen(true);
  };

  const handleDelete = (expId: string) => {
    if (!user) return;
    Alert.alert('Confirm Delete', 'Delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(user.uid, expId);
            setExpenses((prev) => prev.filter((e) => e.id !== expId));
            queryClient.invalidateQueries({ queryKey: ['farmer-context'] });
          } catch {
            Alert.alert('Error', 'Failed to delete expense.');
          }
        },
      },
    ]);
  };

  const handleSaved = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['farmer-context'] });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header title="Expense Tracking" subtitle="Track and manage all your farming expenses" />
      <ScrollView
        contentContainerStyle={{ padding: spacing[4], paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <ExpenseStats expenses={expenses} isLoading={isLoading} />
        <ExpenseChart expenses={expenses} />
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: spacing[3] }}>Recent Expenses</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing[4] }} />
        ) : expenses.length === 0 ? (
          <View style={{ alignItems: 'center', padding: spacing[8], gap: spacing[2], borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, borderColor: colors.border }}>
            <Receipt size={32} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>No expenses recorded yet.</Text>
          </View>
        ) : (
          expenses.map((e) => (
            <ExpenseItem key={e.id} expense={e} onEdit={() => handleOpenForm(e)} onDelete={() => handleDelete(e.id)} />
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 }}
        onPress={() => handleOpenForm(null)}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>
      <ExpenseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} expense={selectedExpense} userId={user?.uid} onSaved={handleSaved} />
    </SafeAreaView>
  );
}
