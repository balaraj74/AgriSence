import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { Header } from '../../src/components/ui/Header';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../src/components/ui/Card';
import { Input } from '../../src/components/ui/Input';
import { FileText, ArrowRight, Info, ChevronDown, Check } from 'lucide-react-native';

const karnatakaDistricts: string[] = [
  'Bagalkote', 'Ballari (Bellary)', 'Belagavi (Belgaum)', 'Bengaluru Rural', 'Bengaluru Urban',
  'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga',
  'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kalaburagi (Gulbarga)',
  'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru (Mysore)', 'Raichur', 'Ramanagara',
  'Shivamogga (Shimoga)', 'Tumakuru (Tumkur)', 'Udupi', 'Uttara Kannada', 'Vijayapura (Bijapur)', 'Yadgir'
];

interface StateInfo {
  name: string;
  url: string;
  districts?: string[];
}

const statesData: Record<string, StateInfo> = {
  andhra_pradesh: { name: 'Andhra Pradesh', url: 'http://meebhoomi.ap.gov.in/' },
  arunachal_pradesh: { name: 'Arunachal Pradesh', url: 'https://namsai.nic.in/service/land-records/' },
  assam: { name: 'Assam', url: 'https://revenueassam.nic.in/ILRMS/' },
  bihar: { name: 'Bihar', url: 'http://biharbhumi.bihar.gov.in/' },
  chhattisgarh: { name: 'Chhattisgarh', url: 'https://bhuiyan.cg.nic.in/' },
  goa: { name: 'Goa', url: 'https://dslr.goa.gov.in/' },
  gujarat: { name: 'Gujarat', url: 'https://anyror.gujarat.gov.in/' },
  haryana: { name: 'Haryana', url: 'https://jamabandi.nic.in/' },
  himachal_pradesh: { name: 'Himachal Pradesh', url: 'https://himachal.nic.in/index.php?lang=1&dpt_id=13' },
  jharkhand: { name: 'Jharkhand', url: 'https://jharbhoomi.nic.in/' },
  karnataka: {
    name: 'Karnataka',
    url: 'https://landrecords.karnataka.gov.in/service2/RTC.aspx',
    districts: karnatakaDistricts,
  },
  kerala: { name: 'Kerala', url: 'http://erekha.kerala.gov.in/' },
  madhya_pradesh: { name: 'Madhya Pradesh', url: 'https://mpbhulekh.gov.in/' },
  maharashtra: { name: 'Maharashtra', url: 'https://bhulekh.mahabhumi.gov.in/' },
  manipur: { name: 'Manipur', url: 'https://louchapathap.nic.in/' },
  meghalaya: { name: 'Meghalaya', url: 'https://meghalaya.gov.in/depts/revenue' },
  mizoram: { name: 'Mizoram', url: 'https://dict.mizoram.gov.in/page/land-record-and-settlement' },
  nagaland: { name: 'Nagaland', url: 'https://dlrs.nagaland.gov.in/' },
  odisha: { name: 'Odisha', url: 'http://bhulekh.ori.nic.in/' },
  punjab: { name: 'Punjab', url: 'http://jamabandi.punjab.gov.in/' },
  rajasthan: { name: 'Rajasthan', url: 'http://apnakhata.raj.nic.in/' },
  sikkim: { name: 'Sikkim', url: 'http://www.sikkimlrdm.gov.in/' },
  tamil_nadu: { name: 'Tamil Nadu', url: 'https://eservices.tn.gov.in/' },
  telangana: { name: 'Telangana', url: 'https://dharani.telangana.gov.in/' },
  tripura: { name: 'Tripura', url: 'https://jami.tripura.gov.in/' },
  uttar_pradesh: { name: 'Uttar Pradesh', url: 'https://upbhulekh.gov.in/' },
  uttarakhand: { name: 'Uttarakhand', url: 'http://bhulekh.uk.gov.in/' },
  west_bengal: { name: 'West Bengal', url: 'http://banglarbhumi.gov.in/' },
  delhi: { name: 'Delhi', url: 'https://dlrc.delhigovt.nic.in/' },
};

interface SelectorProps {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (val: string) => void;
  title: string;
}

function SearchSelectorModal({ visible, onClose, options, selectedValue, onSelect, title }: SelectorProps) {
  const { colors, typography, borderRadius } = useTheme();
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ color: colors.primary, fontFamily: typography.fontFamily.sansBold }}>Cancel</Text></TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  onPress={() => { onSelect(item.value); onClose(); }}
                >
                  <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.foreground, fontFamily: isSelected ? typography.fontFamily.sansBold : typography.fontFamily.sans }]}>
                    {item.label}
                  </Text>
                  {isSelected && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function LandRecordsScreen() {
  const { colors, typography, borderRadius, spacing } = useTheme();
  const [selectedStateKey, setSelectedStateKey] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  const selectedState = selectedStateKey ? statesData[selectedStateKey] : null;
  const districts = selectedState?.districts || [];
  const canProceed = !!selectedState?.url;

  const handleOpenPortal = async () => {
    if (!selectedState?.url) return;
    try {
      const supported = await Linking.canOpenURL(selectedState.url);
      if (supported) {
        await Linking.openURL(selectedState.url);
      } else {
        alert('Cannot open the official portal link.');
      }
    } catch (e) {
      console.error('Failed to open land records portal:', e);
    }
  };

  const stateOptions = Object.entries(statesData).map(([key, data]) => ({
    label: data.name,
    value: key,
  }));

  const districtOptions = districts.map((d) => ({
    label: d,
    value: d,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Land Records" subtitle="State-wise RTC / Pahani portals" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <CardContent style={styles.infoContent}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
              <Info size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.infoTitle, { color: colors.foreground, fontFamily: typography.fontFamily.sansBold }]}>How it Works</Text>
              <Text style={[styles.infoDesc, { color: colors.mutedForeground, fontFamily: typography.fontFamily.sans }]}>
                Select your state to proceed to the official government land records website. Some states allow pre-selecting your district.
              </Text>
            </View>
          </CardContent>
        </Card>

        <Card style={[styles.mainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <CardHeader>
            <CardTitle style={{ fontSize: typography.fontSize.lg }}>Find Your Land Record</CardTitle>
            <CardDescription>Select your location to get a direct link to the portal.</CardDescription>
          </CardHeader>
          <CardContent style={{ gap: spacing[4] }}>
            <View style={{ gap: spacing[2] }}>
              <Text style={{ color: colors.foreground, fontFamily: typography.fontFamily.sansMedium, fontSize: 14 }}>State</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                onPress={() => setStateModalVisible(true)}
              >
                <Text style={{ color: selectedStateKey ? colors.foreground : colors.mutedForeground, fontFamily: typography.fontFamily.sans }}>
                  {selectedState ? selectedState.name : 'Select state'}
                </Text>
                <ChevronDown size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {districts.length > 0 && (
              <View style={{ gap: spacing[2] }}>
                <Text style={{ color: colors.foreground, fontFamily: typography.fontFamily.sansMedium, fontSize: 14 }}>District</Text>
                <TouchableOpacity
                  style={[styles.dropdownTrigger, { borderColor: colors.border, borderRadius: borderRadius.md }]}
                  onPress={() => setDistrictModalVisible(true)}
                >
                  <Text style={{ color: selectedDistrict ? colors.foreground : colors.mutedForeground, fontFamily: typography.fontFamily.sans }}>
                    {selectedDistrict || 'Select district'}
                  </Text>
                  <ChevronDown size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            )}

            <View style={{ gap: spacing[2] }}>
              <Text style={{ color: colors.foreground, fontFamily: typography.fontFamily.sansMedium, fontSize: 14 }}>Survey Number (Optional)</Text>
              <Input
                placeholder="Enter survey number if known"
                value={surveyNumber}
                onChangeText={setSurveyNumber}
              />
            </View>
          </CardContent>
          <CardFooter style={{ borderTopWidth: 0 }}>
            <Button
              label="Proceed to Government Portal"
              disabled={!canProceed}
              style={{ width: '100%' }}
              onPress={handleOpenPortal}
              icon={<ArrowRight size={18} color={colors.primaryForeground} />}
            />
          </CardFooter>
        </Card>
      </ScrollView>

      <SearchSelectorModal
        visible={stateModalVisible}
        onClose={() => setStateModalVisible(false)}
        options={stateOptions}
        selectedValue={selectedStateKey}
        onSelect={(val) => {
          setSelectedStateKey(val);
          setSelectedDistrict('');
        }}
        title="Select State"
      />

      <SearchSelectorModal
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        options={districtOptions}
        selectedValue={selectedDistrict}
        onSelect={setSelectedDistrict}
        title="Select District"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    borderWidth: 1,
  },
  infoContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 15,
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  mainCard: {
    width: '100%',
  },
  dropdownTrigger: {
    height: 48,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '60%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
});
