import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import type { Crop, Expense, Harvest, Field, DiagnosisRecord } from '../types';

// ── Crops ──────────────────────────────────────────────────────
export async function getCrops(userId: string): Promise<Crop[]> {
  const snap = await firestore()
    .collection('users')
    .doc(userId)
    .collection('crops')
    .orderBy('plantedDate', 'desc')
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    plantedDate: d.data().plantedDate?.toDate() ?? null,
    harvestDate: d.data().harvestDate?.toDate() ?? null,
    calendar: (d.data().calendar ?? []).map((task: any) => ({
      ...task,
      startDate: task.startDate?.toDate() ?? new Date(),
      endDate: task.endDate?.toDate() ?? new Date(),
    })),
  })) as Crop[];
}

export async function addCrop(
  userId: string,
  data: Omit<Crop, 'id'>
): Promise<string> {
  const ref = await firestore()
    .collection('users')
    .doc(userId)
    .collection('crops')
    .add({
      ...data,
      plantedDate: data.plantedDate
        ? firestore.Timestamp.fromDate(data.plantedDate)
        : null,
      harvestDate: data.harvestDate
        ? firestore.Timestamp.fromDate(data.harvestDate)
        : null,
    });
  return ref.id;
}

export async function updateCrop(
  userId: string,
  cropId: string,
  data: Partial<Omit<Crop, 'id'>>
): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('crops')
    .doc(cropId)
    .update(data);
}

export async function deleteCrop(userId: string, cropId: string): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('crops')
    .doc(cropId)
    .delete();
}

// ── Expenses ─────────────────────────────────────────────────
export async function getExpenses(userId: string): Promise<Expense[]> {
  const snap = await firestore()
    .collection('users')
    .doc(userId)
    .collection('expenses')
    .orderBy('date', 'desc')
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    date: d.data().date?.toDate() ?? new Date(),
  })) as Expense[];
}

export async function addExpense(
  userId: string,
  data: Omit<Expense, 'id'>
): Promise<string> {
  const ref = await firestore()
    .collection('users')
    .doc(userId)
    .collection('expenses')
    .add({
      ...data,
      date: firestore.Timestamp.fromDate(data.date),
    });
  return ref.id;
}

export async function deleteExpense(
  userId: string,
  expenseId: string
): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('expenses')
    .doc(expenseId)
    .delete();
}

export async function updateExpense(
  userId: string,
  expenseId: string,
  data: Partial<Omit<Expense, 'id'>>
): Promise<void> {
  const updateData: any = { ...data };
  if (data.date) {
    updateData.date = firestore.Timestamp.fromDate(data.date);
  }
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('expenses')
    .doc(expenseId)
    .update(updateData);
}


// ── Harvests ──────────────────────────────────────────────────
export async function getHarvests(userId: string): Promise<Harvest[]> {
  const snap = await firestore()
    .collection('users')
    .doc(userId)
    .collection('harvests')
    .orderBy('harvestDate', 'desc')
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    harvestDate: d.data().harvestDate?.toDate() ?? new Date(),
  })) as Harvest[];
}

export async function addHarvest(
  userId: string,
  data: Omit<Harvest, 'id'>
): Promise<string> {
  const ref = await firestore()
    .collection('users')
    .doc(userId)
    .collection('harvests')
    .add({
      ...data,
      harvestDate: firestore.Timestamp.fromDate(data.harvestDate),
    });
  return ref.id;
}

export async function updateHarvest(
  userId: string,
  harvestId: string,
  data: Partial<Omit<Harvest, 'id'>>
): Promise<void> {
  const updateData: any = { ...data };
  if (data.harvestDate) {
    updateData.harvestDate = firestore.Timestamp.fromDate(data.harvestDate);
  }
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('harvests')
    .doc(harvestId)
    .update(updateData);
}

export async function deleteHarvest(
  userId: string,
  harvestId: string
): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('harvests')
    .doc(harvestId)
    .delete();
}


// ── Fields ────────────────────────────────────────────────────
export async function getFields(userId: string): Promise<Field[]> {
  const snap = await firestore()
    .collection('users')
    .doc(userId)
    .collection('fields')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Field[];
}

export async function addField(
  userId: string,
  data: Omit<Field, 'id'>
): Promise<string> {
  const ref = await firestore()
    .collection('users')
    .doc(userId)
    .collection('fields')
    .add(data);
  return ref.id;
}

export async function deleteField(
  userId: string,
  fieldId: string
): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('fields')
    .doc(fieldId)
    .delete();
}

export async function updateField(
  userId: string,
  fieldId: string,
  data: Partial<Omit<Field, 'id'>>
): Promise<void> {
  await firestore()
    .collection('users')
    .doc(userId)
    .collection('fields')
    .doc(fieldId)
    .update(data);
}


// ── Diagnosis Records ─────────────────────────────────────────
export async function getDiagnosisHistory(
  userId: string
): Promise<DiagnosisRecord[]> {
  const snap = await firestore()
    .collection('users')
    .doc(userId)
    .collection('diagnoses')
    .orderBy('timestamp', 'desc')
    .limit(50)
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    timestamp: d.data().timestamp?.toDate() ?? new Date(),
  })) as DiagnosisRecord[];
}

export async function addDiagnosisRecord(
  userId: string,
  data: Omit<DiagnosisRecord, 'id'>
): Promise<string> {
  const ref = await firestore()
    .collection('users')
    .doc(userId)
    .collection('diagnoses')
    .add({
      ...data,
      timestamp: firestore.Timestamp.fromDate(data.timestamp),
    });
  return ref.id;
}
