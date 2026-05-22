import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2, Scale } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { getHarvests, getCrops, addHarvest, updateHarvest, deleteHarvest } from '../../src/services/firestore';
import type { Harvest, HarvestUnit, Crop } from '../../src/types';

// ── CUSTOM HOOK FOR FETCHING ───────────────────────────────────
function useHarvestsData(userId: string | undefined) {
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [harvestData, cropData] = await Promise.all([
        getHarvests(userId),
        getCrops(userId),
      ]);
      setHarvests(harvestData);
      setCrops(cropData);
    } catch {
      Alert.alert('Error', 'Failed to load harvests.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);
  return { harvests, crops, isLoading, isRefreshing, refetch: load, setHarvests };
}

// ── HARVEST STATS COMPONENT ────────────────────────────────────
function HarvestStats({ harvests, isLoading }: { harvests: Harvest[]; isLoading: boolean }) {
  const { colors, spacing } = useTheme();
  const summary = useMemo(() => {
    const total = harvests.length;
    const uniqueCrops = new Set(harvests.map((h) => h.cropName)).size;
    const latest = harvests.length > 0
      ? [...harvests].sort((a, b) => b.harvestDate.getTime() - a.harvestDate.getTime())[0]
      : null;
    return { total, uniqueCrops, latestName: latest?.cropName ?? 'N/A', latestDate: latest?.harvestDate };
  }, [harvests]);

  return (
    <View style={{ gap: spacing[3], marginBottom: spacing[4] }}>
      <View style={{ flexDirection: 'row', gap: spacing[3] }}>
        <Card style={{ flex: 1, backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[3] }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Total Records</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>
              {isLoading ? '...' : summary.total}
            </Text>
          </CardContent>
        </Card>
        <Card style={{ flex: 1, backgroundColor: colors.card, borderColor: colors.border }}>
          <CardContent style={{ padding: spacing[3] }}>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Harvested Crops</Text>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginTop: 4 }}>
              {isLoading ? '...' : summary.uniqueCrops}
            </Text>
          </CardContent>
        </Card>
      </View>
      <Card style={{ backgroundColor: colors.card, borderColor: colors.border }}>
        <CardContent style={{ padding: spacing[3] }}>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Latest Harvest</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginTop: 2 }}>{summary.latestName}</Text>
          {summary.latestDate && <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>{format(summary.latestDate, 'dd MMM, yyyy')}</Text>}
        </CardContent>
      </Card>
    </View>
  );
}

// ── HARVEST ITEM COMPONENT ─────────────────────────────────────
interface HarvestItemProps {
  harvest: Harvest;
  onEdit: () => void;
  onDelete: () => void;
}
function HarvestItem({ harvest, onEdit, onDelete }: HarvestItemProps) {
  const { colors, spacing } = useTheme();

  return (
    <Card style={{ backgroundColor: colors.card, borderColor: colors.border, marginBottom: spacing[3] }}>
      <CardContent style={{ padding: spacing[3], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>{harvest.cropName}</Text>
            <Badge label={`${harvest.quantity} ${harvest.unit}`} variant="default" style={{ backgroundColor: `${colors.primary}20`, borderColor: colors.primary }} />
          </View>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{format(harvest.harvestDate, 'dd MMM, yyyy')}</Text>
          {harvest.notes && <Text style={{ fontSize: 12, color: colors.mutedForeground, fontStyle: 'italic' }}>{harvest.notes}</Text>}
        </View>
        <View style={{ flexDirection: 'row', gap: spacing[1] }}>
          <TouchableOpacity onPress={onEdit} style={{ padding: 6 }}><Pencil size={14} color={colors.mutedForeground} /></TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}><Trash2 size={14} color={colors.destructive} /></TouchableOpacity>
        </View>
      </CardContent>
    </Card>
  );
}

// ── FORM STATE HOOK ────────────────────────────────────────────
function useHarvestForm(harvest: Harvest | null, crops: Crop[], userId: string | undefined, onSaved: () => void, onClose: () => void) {
  const [cropId, setCropId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<HarvestUnit>('kg');
  const [dateStr, setDateStr] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCropId(harvest?.cropId ?? crops[0]?.id ?? '');
    setQuantity(harvest?.quantity ? harvest.quantity.toString() : '');
    setUnit(harvest?.unit ?? 'kg');
    setDateStr(harvest?.harvestDate ? format(harvest.harvestDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    setNotes(harvest?.notes ?? '');
  }, [harvest, crops]);

  const handleSave = async () => {
    if (!userId) return;
    const selectedCrop = crops.find((c) => c.id === cropId);
    const parsedDate = new Date(dateStr);
    if (!selectedCrop || !quantity.trim() || isNaN(parsedDate.getTime())) {
      Alert.alert('Validation Error', 'Invalid inputs.');
      return;
    }
    setIsSaving(true);
    try {
      const data = { cropId, cropName: selectedCrop.name, quantity: parseFloat(quantity), unit, harvestDate: parsedDate, notes: notes || undefined };
      if (harvest) await updateHarvest(userId, harvest.id, data);
      else await addHarvest(userId, data);
      onSaved();
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to save harvest record.');
    } finally {
      setIsSaving(false);
    }
  };

  return { cropId, setCropId, quantity, setQuantity, unit, setUnit, dateStr, setDateStr, notes, setNotes, isSaving, handleSave };
}

// ── SELECTOR SUBCOMPONENTS ─────────────────────────────────────
function CropSelector({ crops, selectedId, onChange }: { crops: Crop[]; selectedId: string; onChange: (id: string) => void }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginTop: 4 }}>
      {crops.map((c) => {
        const sel = selectedId === c.id;
        return (
          <TouchableOpacity key={c.id} onPress={() => onChange(c.id)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary : 'transparent' }}>
            <Text style={{ color: sel ? colors.background : colors.foreground, fontSize: 12, fontWeight: '600' }}>{c.name}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function UnitSelector({ value, onChange }: { value: HarvestUnit; onChange: (unit: HarvestUnit) => void }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing[2], marginTop: 4 }}>
      {(['kg', 'quintal', 'tonne'] as HarvestUnit[]).map((u) => {
        const sel = value === u;
        return (
          <TouchableOpacity key={u} onPress={() => onChange(u)} style={{ flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primary : 'transparent' }}>
            <Text style={{ color: sel ? colors.background : colors.foreground, fontSize: 12, fontWeight: '600' }}>{u}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ModalActions({ onCancel, onSave, isSaving }: { onCancel: () => void; onSave: () => void; isSaving: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
      <Button label="Cancel" variant="outline" style={{ flex: 1 }} onPress={onCancel} disabled={isSaving} />
      <Button label={isSaving ? 'Saving...' : 'Save'} variant="default" style={{ flex: 1 }} onPress={onSave} disabled={isSaving} />
    </View>
  );
}

// ── FORM MODAL COMPONENT ───────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  harvest: Harvest | null;
  crops: Crop[];
  userId: string | undefined;
  onSaved: () => void;
}
function HarvestFormModal({ isOpen, onClose, harvest, crops, userId, onSaved }: ModalProps) {
  const { colors, spacing } = useTheme();
  const state = useHarvestForm(harvest, crops, userId, onSaved, onClose);

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
        <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing[4], maxHeight: '90%', borderColor: colors.border, borderTopWidth: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: spacing[4] }}>{harvest ? 'Edit Harvest Record' : 'Record Output'}</Text>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing[3], paddingBottom: spacing[6] }}>
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.foreground }}>Select Crop</Text>
            <CropSelector crops={crops} selectedId={state.cropId} onChange={state.setCropId} />
            <Input label="Quantity" placeholder="e.g. 150" value={state.quantity} onChangeText={state.setQuantity} keyboardType="numeric" />
            <Text style={{ fontSize: 13, fontWeight: '500', color: colors.foreground }}>Unit</Text>
            <UnitSelector value={state.unit} onChange={state.setUnit} />
            <Input label="Harvest Date (YYYY-MM-DD)" placeholder="YYYY-MM-DD" value={state.dateStr} onChangeText={state.setDateStr} />
            <Input label="Notes" placeholder="Additional notes..." value={state.notes} onChangeText={state.setNotes} />
            <ModalActions onCancel={onClose} onSave={state.handleSave} isSaving={state.isSaving} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── MAIN HARVESTS SCREEN ───────────────────────────────────────
export default function HarvestsScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { harvests, crops, isLoading, isRefreshing, refetch, setHarvests } = useHarvestsData(user?.uid);
  const [selectedHarvest, setSelectedHarvest] = useState<Harvest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenForm = (harv: Harvest | null) => {
    if (crops.length === 0) {
      Alert.alert('No Crops Found', 'Please add a crop in the Crops screen first.');
      return;
    }
    setSelectedHarvest(harv);
    setIsModalOpen(true);
  };

  const handleDelete = (harvId: string) => {
    if (!user) return;
    Alert.alert('Confirm Delete', 'Delete this harvest record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHarvest(user.uid, harvId);
            setHarvests((prev) => prev.filter((h) => h.id !== harvId));
            queryClient.invalidateQueries({ queryKey: ['farmer-context'] });
          } catch {
            Alert.alert('Error', 'Failed to delete harvest record.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header title="Harvest Tracking" subtitle="Record and track your crop yield and output" />
      <ScrollView
        contentContainerStyle={{ padding: spacing[4], paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />}
      >
        <HarvestStats harvests={harvests} isLoading={isLoading} />
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: spacing[3] }}>Harvest Log</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing[4] }} />
        ) : harvests.length === 0 ? (
          <View style={{ alignItems: 'center', padding: spacing[8], gap: spacing[2], borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, borderColor: colors.border }}>
            <Scale size={32} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>No harvests recorded yet.</Text>
          </View>
        ) : (
          harvests.map((h) => (
            <HarvestItem key={h.id} harvest={h} onEdit={() => handleOpenForm(h)} onDelete={() => handleDelete(h.id)} />
          ))
        )}
      </ScrollView>
      <TouchableOpacity
        style={{ position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 }}
        onPress={() => handleOpenForm(null)}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>
      <HarvestFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} harvest={selectedHarvest} crops={crops} userId={user?.uid} onSaved={() => { refetch(); queryClient.invalidateQueries({ queryKey: ['farmer-context'] }); }} />
    </SafeAreaView>
  );
}
