import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/hooks/useAuth';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { getFields, getCrops, addField, updateField, deleteField } from '../../src/services/firestore';
import type { Field, Crop } from '../../src/types';

// ── GEODESIC & GEOMETRY MATH HELPERS ───────────────────────────
function getDistance(c1: { latitude: number; longitude: number }, c2: { latitude: number; longitude: number }): number {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const lat1 = c1.latitude * rad;
  const lat2 = c2.latitude * rad;
  const dLat = (c2.latitude - c1.latitude) * rad;
  const dLng = (c2.longitude - c1.longitude) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calculatePerimeter(coords: Array<{ latitude: number; longitude: number }>): number {
  if (coords.length < 2) return 0;
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    total += getDistance(coords[i]!, coords[(i + 1) % coords.length]!);
  }
  return total;
}

function calculateCentroid(coords: Array<{ latitude: number; longitude: number }>): { latitude: number; longitude: number } {
  if (coords.length === 0) return { latitude: 20.5937, longitude: 78.9629 };
  const sumLat = coords.reduce((sum, c) => sum + c.latitude, 0);
  const sumLng = coords.reduce((sum, c) => sum + c.longitude, 0);
  return { latitude: sumLat / coords.length, longitude: sumLng / coords.length };
}

function calculateArea(coords: Array<{ latitude: number; longitude: number }>): number {
  if (coords.length < 3) return 0;
  const centroid = calculateCentroid(coords);
  const rad = Math.PI / 180;
  const cosLat = Math.cos(centroid.latitude * rad);
  const x = coords.map((c) => c.longitude * 111320 * cosLat);
  const y = coords.map((c) => c.latitude * 110540);
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const next = (i + 1) % coords.length;
    area += x[i]! * y[next]! - x[next]! * y[i]!;
  }
  return Math.abs(area) * 0.5 * 0.000247105;
}

// ── DATA AND FORM HOOKS ────────────────────────────────────────
function useFieldMappingData(userId: string | undefined) {
  const [fields, setFields] = useState<Field[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      const [fieldData, cropData] = await Promise.all([getFields(userId), getCrops(userId)]);
      setFields(fieldData);
      setCrops(cropData);
    } catch {
      Alert.alert('Error', 'Failed to load fields and crops.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);
  return { fields, crops, isLoading, refetch: load, setFields };
}

function useFieldForm(userId: string | undefined, onSaved: () => void) {
  const [fieldName, setFieldName] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [village, setVillage] = useState('');
  const [cropId, setCropId] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Array<{ latitude: number; longitude: number }>>([]);
  const [isSaving, setIsSaving] = useState(false);

  const saveFieldRecord = async (fieldId: string | null, crops: Crop[]) => {
    if (!userId || !fieldName.trim() || !surveyNumber.trim() || !village.trim() || coordinates.length < 3) {
      Alert.alert('Error', 'Fill all details & draw at least 3 vertices.');
      return;
    }
    setIsSaving(true);
    try {
      const selectedCrop = crops.find((c) => c.id === cropId);
      const data = {
        fieldName, surveyNumber, village,
        area: calculateArea(coordinates), perimeter: calculatePerimeter(coordinates),
        coordinates, centroid: calculateCentroid(coordinates),
        cropId: selectedCrop?.id ?? null, cropName: selectedCrop?.name ?? null,
      };
      if (fieldId) await updateField(userId, fieldId, data);
      else await addField(userId, data);
      onSaved();
    } catch {
      Alert.alert('Error', 'Failed to save field.');
    } finally {
      setIsSaving(false);
    }
  };

  return { fieldName, setFieldName, surveyNumber, setSurveyNumber, village, setVillage, cropId, setCropId, coordinates, setCoordinates, isSaving, saveFieldRecord };
}

// ── COMPONENT STATES AND CHILD RENDERS ─────────────────────────
function useFieldScreenState(user: any, setFields: any, form: any, refetch: () => void) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  const startAdd = () => {
    form.setFieldName(''); form.setSurveyNumber(''); form.setVillage(''); form.setCropId(null); form.setCoordinates([]);
    setIsDrawing(true); setEditingFieldId(null);
  };

  const startEdit = (field: Field) => {
    form.setFieldName(field.fieldName); form.setSurveyNumber(field.surveyNumber);
    form.setVillage(field.village); form.setCropId(field.cropId ?? null);
    form.setCoordinates(field.coordinates); setIsDrawing(true); setEditingFieldId(field.id);
  };

  const handleDelete = (fieldId: string) => {
    if (!user) return;
    Alert.alert('Confirm Delete', 'Delete this field?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteField(user.uid, fieldId);
            setFields((prev: any) => prev.filter((f: any) => f.id !== fieldId));
          } catch {
            Alert.alert('Error', 'Failed to delete field.');
          }
        },
      },
    ]);
  };

  const handleMapPress = (e: any) => {
    if (isDrawing) {
      const { latitude, longitude } = e.nativeEvent.coordinate;
      form.setCoordinates((prev: any) => [...prev, { latitude, longitude }]);
    }
  };

  return { selectedFieldId, setSelectedFieldId, isDrawing, setIsDrawing, editingFieldId, setEditingFieldId, startAdd, startEdit, handleDelete, handleMapPress };
}

function FormFields({ name, setName, survey, setSurvey, village, setVillage, crops, cropId, setCropId }: any) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ gap: spacing[2] }}>
      <Input label="Field Name" placeholder="e.g. North Field" value={name} onChangeText={setName} />
      <Input label="Survey Number" placeholder="e.g. 123/4" value={survey} onChangeText={setSurvey} />
      <Input label="Village" placeholder="e.g. Rampur" value={village} onChangeText={setVillage} />
      <Text style={{ fontSize: 13, fontWeight: '500', color: colors.foreground, marginTop: 4 }}>Crop (Optional)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing[2], paddingVertical: 4 }}>
        <TouchableOpacity onPress={() => setCropId(null)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: !cropId ? colors.primary : colors.border, backgroundColor: !cropId ? colors.primary : 'transparent' }}>
          <Text style={{ color: !cropId ? colors.background : colors.foreground, fontSize: 12, fontWeight: '600' }}>None</Text>
        </TouchableOpacity>
        {crops.map((c: Crop) => (
          <TouchableOpacity key={c.id} onPress={() => setCropId(c.id)} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: cropId === c.id ? colors.primary : colors.border, backgroundColor: cropId === c.id ? colors.primary : 'transparent' }}>
            <Text style={{ color: cropId === c.id ? colors.background : colors.foreground, fontSize: 12, fontWeight: '600' }}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function FieldItem({ field, isSelected, onPress, onEdit, onDelete }: any) {
  const { colors, spacing } = useTheme();
  return (
    <Card style={{ backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border, marginBottom: spacing[2] }}>
      <TouchableOpacity onPress={onPress}>
        <CardContent style={{ padding: spacing[3], flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.foreground }}>{field.fieldName}</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Survey: {field.surveyNumber} ({field.village})</Text>
            <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>{field.area.toFixed(2)} ac / {field.perimeter.toFixed(1)} m</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[1] }}>
            <TouchableOpacity onPress={onEdit} style={{ padding: 6 }}><Pencil size={14} color={colors.mutedForeground} /></TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={{ padding: 6 }}><Trash2 size={14} color={colors.destructive} /></TouchableOpacity>
          </View>
        </CardContent>
      </TouchableOpacity>
    </Card>
  );
}

// ── MAIN FIELD MAPPING SCREEN ──────────────────────────────────
export default function FieldMappingScreen() {
  const { colors, spacing } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { fields, crops, isLoading, refetch, setFields } = useFieldMappingData(user?.uid);
  const form = useFieldForm(user?.uid, () => {
    screen.setIsDrawing(false); screen.setEditingFieldId(null); refetch();
    queryClient.invalidateQueries({ queryKey: ['farmer-context'] });
  });
  const screen = useFieldScreenState(user, setFields, form, refetch);
  const selectedField = fields.find((f) => f.id === screen.selectedFieldId);
  const centerCoord = selectedField?.centroid ?? (fields[0]?.centroid) ?? { latitude: 20.5937, longitude: 78.9629 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Header title="Field Mapping" subtitle="Draw and measure your field boundaries" />
      <View style={{ flex: 1 }}>
        <MapView
          style={{ flex: 1 }}
          initialRegion={{ latitude: centerCoord.latitude, longitude: centerCoord.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }}
          mapType="hybrid"
          onPress={screen.handleMapPress}
        >
          {!screen.isDrawing && fields.map((f) => (
            <Polygon key={f.id} coordinates={f.coordinates} strokeColor={screen.selectedFieldId === f.id ? colors.primary : '#ffffff'} strokeWidth={2} fillColor={screen.selectedFieldId === f.id ? `${colors.primary}50` : 'rgba(255,255,255,0.2)'} tappable onPress={() => screen.setSelectedFieldId(f.id)} />
          ))}
          {screen.isDrawing && form.coordinates.length > 0 && (
            <Polygon coordinates={form.coordinates} strokeColor={colors.primary} strokeWidth={2} fillColor={`${colors.primary}30`} />
          )}
          {screen.isDrawing && form.coordinates.map((coord, idx) => (
            <Marker key={idx} coordinate={coord} onPress={() => form.setCoordinates((prev) => prev.filter((_, i) => i !== idx))} />
          ))}
        </MapView>
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: '45%', backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing[3], borderTopWidth: 1, borderColor: colors.border }}>
          {screen.isDrawing ? (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>{screen.editingFieldId ? 'Edit Boundary' : 'Draw Boundary'} (Tap map; tap pin to delete)</Text>
              <FormFields name={form.fieldName} setName={form.setFieldName} survey={form.surveyNumber} setSurvey={form.setSurveyNumber} village={form.village} setVillage={form.setVillage} crops={crops} cropId={form.cropId} setCropId={form.setCropId} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Area: <Text style={{ color: colors.primary, fontWeight: '600' }}>{calculateArea(form.coordinates).toFixed(2)} ac</Text></Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Perimeter: <Text style={{ color: colors.primary, fontWeight: '600' }}>{calculatePerimeter(form.coordinates).toFixed(1)} m</Text></Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button label="Clear" variant="outline" style={{ flex: 1 }} onPress={() => form.setCoordinates([])} disabled={form.isSaving} />
                <Button label="Cancel" variant="outline" style={{ flex: 1 }} onPress={() => screen.setIsDrawing(false)} disabled={form.isSaving} />
                <Button label="Save" variant="default" style={{ flex: 1 }} onPress={() => form.saveFieldRecord(screen.editingFieldId, crops)} disabled={form.isSaving} />
              </View>
            </ScrollView>
          ) : (
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.foreground }}>My Fields</Text>
                <TouchableOpacity onPress={screen.startAdd} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primary, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 }}><Plus size={14} color={colors.background} /><Text style={{ fontSize: 12, color: colors.background, fontWeight: '600' }}>Add Field</Text></TouchableOpacity>
              </View>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : fields.length === 0 ? (
                <Text style={{ color: colors.mutedForeground, fontSize: 12, textAlign: 'center', marginVertical: 12 }}>No fields mapped yet.</Text>
              ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                  {fields.map((f) => (
                    <FieldItem key={f.id} field={f} isSelected={screen.selectedFieldId === f.id} onPress={() => screen.setSelectedFieldId(f.id)} onEdit={() => screen.startEdit(f)} onDelete={() => screen.handleDelete(f.id)} />
                  ))}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
