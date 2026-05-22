import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Keyboard,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { format, parse, isValid, getYear } from 'date-fns';
import {
  Sprout,
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { Badge } from '../../src/components/ui/Badge';
import { getCrops, addCrop, updateCrop, deleteCrop } from '../../src/services/firestore';
import { generateCropCalendar } from '../../src/services/ai';
import type { Crop, CropStatus, CropTask } from '../../src/types';

// Helper: Parse AI-generated date ranges into concrete dates
const parseDateRange = (range: string, year: number): { startDate: Date; endDate: Date } => {
  const parts = range.split(' - ').map((p) => p.trim());
  const parseWithYear = (dateStr: string) => {
    const fullDateStr = `${dateStr} ${year}`;
    let dt = parse(fullDateStr, 'MMMM d yyyy', new Date());
    if (!isValid(dt)) {
      dt = parse(fullDateStr, 'MMM d yyyy', new Date());
    }
    return dt;
  };
  const startDate = parseWithYear(parts[0]);
  const endDate = parts.length > 1 ? parseWithYear(parts[1]) : startDate;

  if (!isValid(startDate) || !isValid(endDate)) {
    const now = new Date();
    return { startDate: now, endDate: now };
  }
  return { startDate, endDate };
};

export default function CropsScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [filteredCrops, setFilteredCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<CropStatus | 'All'>('All');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCropsData = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getCrops(user.uid);
      setCrops(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load crops data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCropsData();
  }, [fetchCropsData]);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredCrops(crops);
    } else {
      setFilteredCrops(crops.filter((c) => c.status === activeTab));
    }
  }, [crops, activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCropsData();
  };

  const handleTaskToggle = async (crop: Crop, taskIndex: number, isCompleted: boolean) => {
    if (!user) return;
    const originalCrops = [...crops];
    const updatedCalendar = [...crop.calendar];
    updatedCalendar[taskIndex] = { ...updatedCalendar[taskIndex], isCompleted };

    // Optimistic Update
    const updatedCrops = crops.map((c) =>
      c.id === crop.id ? { ...c, calendar: updatedCalendar } : c
    );
    setCrops(updatedCrops);

    try {
      await updateCrop(user.uid, crop.id, { calendar: updatedCalendar });
      queryClient.invalidateQueries({ queryKey: ['farmer-context'] });
    } catch (err) {
      console.error(err);
      setCrops(originalCrops);
      Alert.alert('Error', 'Failed to save task status.');
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!user) return;
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this crop?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCrop(user.uid, cropId);
            setCrops(crops.filter((c) => c.id !== cropId));
            queryClient.invalidateQueries({ queryKey: ['farmer-context'] });
          } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to delete crop.');
          }
        },
      },
    ]);
  };

  const handleOpenForm = (crop: Crop | null) => {
    setSelectedCrop(crop);
    setIsModalOpen(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Crop Tracker" subtitle="Manage your fields and calendars" />

      <StatusTabs activeTab={activeTab} setActiveTab={setActiveTab} colors={colors} />

      <ScrollView
        contentContainerStyle={{ padding: spacing[4], gap: spacing[4], paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing[10] }} />
        ) : filteredCrops.length === 0 ? (
          <EmptyState activeTab={activeTab} colors={colors} spacing={spacing} />
        ) : (
          filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onToggleTask={(taskIdx, isCompleted) => handleTaskToggle(crop, taskIdx, isCompleted)}
              onEdit={() => handleOpenForm(crop)}
              onDelete={() => handleDeleteCrop(crop.id)}
              colors={colors}
              spacing={spacing}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => handleOpenForm(null)}
        activeOpacity={0.8}
      >
        <Plus size={24} color={colors.background} />
      </TouchableOpacity>

      <CropModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        crop={selectedCrop}
        userId={user?.uid}
        onSaved={fetchCropsData}
      />
    </SafeAreaView>
  );
}

// ── STATUS FILTER TABS ─────────────────────────────────────────
interface StatusTabsProps {
  activeTab: CropStatus | 'All';
  setActiveTab: (tab: CropStatus | 'All') => void;
  colors: any;
}
function StatusTabs({ activeTab, setActiveTab, colors }: StatusTabsProps) {
  const tabs: Array<CropStatus | 'All'> = ['All', 'Planned', 'Growing', 'Harvested'];
  return (
    <View style={[styles.tabsContainer, { borderBottomColor: colors.border }]}>
      {tabs.map((tab) => {
        const isSelected = activeTab === tab;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, isSelected && { borderBottomColor: colors.primary }]}
          >
            <Text style={[styles.tabText, { color: isSelected ? colors.primary : colors.mutedForeground }]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── EMPTY STATE ────────────────────────────────────────────────
function EmptyState({ activeTab, colors, spacing }: { activeTab: string; colors: any; spacing: any }) {
  return (
    <View style={[styles.emptyContainer, { borderColor: colors.border, marginTop: spacing[6] }]}>
      <Sprout size={48} color={colors.mutedForeground} style={{ marginBottom: spacing[2] }} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No crops found</Text>
      <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
        {activeTab === 'All'
          ? 'Add your first crop to generate a customized AI growth schedule.'
          : `No crops currently in "${activeTab}" status.`}
      </Text>
    </View>
  );
}

// ── CROP CARD COMPONENT ────────────────────────────────────────
interface CropCardProps {
  crop: Crop;
  onToggleTask: (taskIndex: number, isCompleted: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  colors: any;
  spacing: any;
}
function CropCard({ crop, onToggleTask, onEdit, onDelete, colors, spacing }: CropCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusStyles: Record<CropStatus, { bg: string; text: string }> = {
    Planned: { bg: `${colors.accent}20`, text: colors.accent },
    Growing: { bg: `${colors.success}20`, text: colors.success },
    Harvested: { bg: `${colors.info}20`, text: colors.info },
  };

  const nextTask = crop.calendar
    ?.filter((t) => !t.isCompleted)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  const nextTaskIndex = nextTask ? crop.calendar.indexOf(nextTask) : -1;

  return (
    <Card style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <CardContent style={{ padding: spacing[4] }}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{crop.name}</Text>
          <Badge
            label={crop.status}
            variant="outline"
            style={{
              backgroundColor: statusStyles[crop.status].bg,
              borderColor: statusStyles[crop.status].text,
            }}
          />
        </View>

        {crop.region && (
          <View style={styles.infoRow}>
            <MapPin size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{crop.region}</Text>
          </View>
        )}

        <View style={styles.datesGrid}>
          <View style={styles.dateBlock}>
            <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Planted</Text>
            <Text style={[styles.dateVal, { color: colors.foreground }]}>
              {crop.plantedDate ? format(crop.plantedDate, 'MMM d, yyyy') : '—'}
            </Text>
          </View>
          <View style={styles.dateBlock}>
            <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>Harvest Est.</Text>
            <Text style={[styles.dateVal, { color: colors.foreground }]}>
              {crop.harvestDate ? format(crop.harvestDate, 'MMM d, yyyy') : '—'}
            </Text>
          </View>
        </View>

        {/* Dynamic metrics replicating web layout */}
        <View style={[styles.metricsRow, { backgroundColor: colors.background }]}>
          <View style={styles.metric}>
            <Text style={[styles.metricVal, { color: colors.foreground }]}>6.8</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Soil pH</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricVal, { color: colors.foreground }]}>Good</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Quality</Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricVal, { color: colors.foreground }]}>Balanced</Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>Fertilizer</Text>
          </View>
        </View>

        {/* Next Task / Task List */}
        <View style={[styles.taskContainer, { borderTopColor: colors.border }]}>
          {expanded ? (
            <TaskList crop={crop} onToggle={onToggleTask} colors={colors} />
          ) : (
            <NextTaskView nextTask={nextTask} nextTaskIndex={nextTaskIndex} onToggle={onToggleTask} colors={colors} />
          )}

          {crop.calendar && crop.calendar.length > 0 && (
            <TouchableOpacity
              onPress={() => setExpanded(!expanded)}
              style={styles.expandButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.expandText, { color: colors.primary }]}>
                {expanded ? 'Hide Full Calendar' : 'Show Full Calendar'}
              </Text>
              {expanded ? (
                <ChevronUp size={16} color={colors.primary} />
              ) : (
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Card Actions */}
        <View style={styles.cardActionsRow}>
          <Button label="Edit" variant="outline" size="sm" icon={<Pencil size={14} color={colors.foreground} />} onPress={onEdit} />
          <Button label="Delete" variant="destructive" size="sm" icon={<Trash2 size={14} color={colors.destructiveForeground} />} onPress={onDelete} />
        </View>
      </CardContent>
    </Card>
  );
}

// ── NEXT TASK WIDGET ───────────────────────────────────────────
interface NextTaskViewProps {
  nextTask: CropTask | undefined;
  nextTaskIndex: number;
  onToggle: (index: number, isCompleted: boolean) => void;
  colors: any;
}
function NextTaskView({ nextTask, nextTaskIndex, onToggle, colors }: NextTaskViewProps) {
  if (!nextTask) {
    return <Text style={[styles.noTasksText, { color: colors.mutedForeground }]}>No upcoming tasks</Text>;
  }
  return (
    <View style={styles.nextTaskWrapper}>
      <Text style={[styles.taskSectionTitle, { color: colors.foreground }]}>Next Task</Text>
      <TouchableOpacity
        style={styles.taskItem}
        activeOpacity={0.7}
        onPress={() => onToggle(nextTaskIndex, !nextTask.isCompleted)}
      >
        <View style={[styles.checkbox, { borderColor: colors.border }]} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskName, { color: colors.foreground }]}>{nextTask.taskName}</Text>
          <Text style={[styles.taskTime, { color: colors.mutedForeground }]}>
            {format(nextTask.startDate, 'MMM d')} - {format(nextTask.endDate, 'MMM d')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ── FULL TASK LIST ─────────────────────────────────────────────
interface TaskListProps {
  crop: Crop;
  onToggle: (index: number, isCompleted: boolean) => void;
  colors: any;
}
function TaskList({ crop, onToggle, colors }: TaskListProps) {
  if (!crop.calendar || crop.calendar.length === 0) {
    return <Text style={[styles.noTasksText, { color: colors.mutedForeground }]}>No schedule generated</Text>;
  }

  return (
    <View style={styles.taskListWrapper}>
      <Text style={[styles.taskSectionTitle, { color: colors.foreground }]}>Crop Calendar</Text>
      {crop.calendar.map((task, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.taskItem}
          activeOpacity={0.7}
          onPress={() => onToggle(idx, !task.isCompleted)}
        >
          {task.isCompleted ? (
            <CheckCircle2 size={20} color={colors.success} />
          ) : (
            <View style={[styles.checkbox, { borderColor: colors.border }]} />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.taskName,
                {
                  color: colors.foreground,
                  textDecorationLine: task.isCompleted ? 'line-through' : 'none',
                },
              ]}
            >
              {task.taskName}
            </Text>
            <Text style={[styles.taskTime, { color: colors.mutedForeground }]}>
              {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d')}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ── ADD / EDIT CROP MODAL FORM ─────────────────────────────────
interface CropModalProps {
  isOpen: boolean;
  onClose: () => void;
  crop: Crop | null;
  userId: string | undefined;
  onSaved: () => void;
}
function CropModal({ isOpen, onClose, crop, userId, onSaved }: CropModalProps) {
  const { colors, spacing } = useTheme();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState<CropStatus>('Planned');
  const [plantedStr, setPlantedStr] = useState('');
  const [harvestStr, setHarvestStr] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(crop?.name ?? '');
      setRegion(crop?.region ?? '');
      setStatus(crop?.status ?? 'Planned');
      setPlantedStr(crop?.plantedDate ? format(crop.plantedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
      setHarvestStr(crop?.harvestDate ? format(crop.harvestDate, 'yyyy-MM-dd') : '');
      setNotes(crop?.notes ?? '');
    }
  }, [isOpen, crop]);

  const handleSave = async () => {
    if (!userId) return;
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Crop Name is required.');
      return;
    }

    const plantedDate = plantedStr ? new Date(plantedStr) : null;
    const harvestDate = harvestStr ? new Date(harvestStr) : null;

    if (plantedDate && isNaN(plantedDate.getTime())) {
      Alert.alert('Validation Error', 'Planted Date must be in YYYY-MM-DD format.');
      return;
    }
    if (harvestDate && isNaN(harvestDate.getTime())) {
      Alert.alert('Validation Error', 'Harvest Date must be in YYYY-MM-DD format.');
      return;
    }

    setIsSaving(true);
    try {
      let calendar: CropTask[] = crop?.calendar ?? [];

      // Generate AI Calendar for new crops if region & name are specified
      if (!crop && region && name) {
        try {
          const aiResponse = await generateCropCalendar({
            cropName: name,
            region,
          });
          const referenceDate = plantedDate ?? new Date();
          const calendarYear = getYear(referenceDate);

          calendar = aiResponse.tasks.map((task) => {
            const { startDate, endDate } = parseDateRange(task.dateRange, calendarYear);
            return {
              taskName: task.taskName,
              startDate,
              endDate,
              isCompleted: false,
            };
          });
        } catch (err) {
          console.warn('AI Calendar generation failed:', err);
        }
      }

      const cropData: Omit<Crop, 'id'> = {
        name,
        status,
        region: region || null,
        plantedDate,
        harvestDate,
        notes: notes || null,
        calendar,
      };

      if (crop) {
        await updateCrop(userId, crop.id, cropData);
      } else {
        await addCrop(userId, cropData);
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save crop record.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {crop ? 'Edit Crop' : 'Add New Crop'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: spacing[4] }} keyboardShouldPersistTaps="handled">
            <Input label="Crop Name" placeholder="e.g. Wheat" value={name} onChangeText={setName} />
            <View style={{ height: spacing[3] }} />
            <Input label="Region" placeholder="e.g. Punjab" value={region} onChangeText={setRegion} />
            <View style={{ height: spacing[3] }} />

            {/* Custom Status Picker */}
            <Text style={[styles.pickerLabel, { color: colors.foreground }]}>Status</Text>
            <View style={styles.pickerRow}>
              {(['Planned', 'Growing', 'Harvested'] as CropStatus[]).map((s) => {
                const isSelected = status === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.pickerBtn,
                      { borderColor: colors.border },
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setStatus(s)}
                  >
                    <Text
                      style={[
                        styles.pickerBtnText,
                        { color: isSelected ? colors.background : colors.foreground },
                      ]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: spacing[3] }} />
            <Input
              label="Planted Date (YYYY-MM-DD)"
              placeholder="YYYY-MM-DD"
              value={plantedStr}
              onChangeText={setPlantedStr}
            />
            <View style={{ height: spacing[3] }} />
            <Input
              label="Harvest Date (YYYY-MM-DD)"
              placeholder="YYYY-MM-DD"
              value={harvestStr}
              onChangeText={setHarvestStr}
            />
            <View style={{ height: spacing[3] }} />
            <Input label="Notes" placeholder="Any additional notes..." value={notes} onChangeText={setNotes} />
            <View style={{ height: spacing[6] }} />

            {!crop && name && region && (
              <View style={[styles.aiNotice, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}>
                <Sparkles size={16} color={colors.primary} />
                <Text style={[styles.aiNoticeText, { color: colors.foreground }]}>
                  AI will generate a customized crop tasks calendar for {name} in {region}.
                </Text>
              </View>
            )}

            <View style={{ height: spacing[6] }} />
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Button label="Cancel" variant="outline" onPress={onClose} disabled={isSaving} />
            <Button
              label={isSaving ? 'Saving...' : 'Save'}
              variant="default"
              onPress={handleSave}
              disabled={isSaving}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
  },
  datesGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  dateBlock: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  metricLabel: {
    fontSize: 11,
  },
  taskContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 16,
  },
  taskSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  nextTaskWrapper: {},
  taskListWrapper: {
    gap: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
  },
  taskName: {
    fontSize: 13,
    fontWeight: '600',
  },
  taskTime: {
    fontSize: 11,
  },
  noTasksText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pickerBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aiNotice: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  aiNoticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
});
