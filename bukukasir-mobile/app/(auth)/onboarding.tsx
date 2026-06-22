import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Clock, Store, Table2, UserPlus, Utensils } from 'lucide-react-native';
import { useTheme } from '../../shared/theme';
import { useSaveOnboardingSetup } from '../../shared/hooks/queries';
import {
  Panel,
  PrimaryButton,
  SectionHeader,
  Stepper,
  TextField,
  usePOSLayout,
} from '../../shared/pos/components';
import { onboardingSteps } from '../../shared/pos/demoData';

export default function OnboardingScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { isCompact } = usePOSLayout();
  const saveSetup = useSaveOnboardingSetup();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('8123456789');
  const [otp, setOtp] = useState('123456');
  const [businessName, setBusinessName] = useState('Warung Makan Sederhana');
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [serviceFee, setServiceFee] = useState('5');
  const [tableCount, setTableCount] = useState('8');
  const [menuSeed, setMenuSeed] = useState('Nasi Goreng, Es Teh, Ayam Bakar');
  const [staffPhone, setStaffPhone] = useState('+62 813 7700 1111');
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'error' | 'success'; message: string } | null>(null);

  const cleanPhone = (value: string) => value.replace(/\D/g, '');
  const menuItems = menuSeed.split(',').map((item) => item.trim()).filter(Boolean);
  const serviceFeeNumber = Number.parseInt(serviceFee, 10);
  const tableCountNumber = Number.parseInt(tableCount, 10);

  const errorForStep = (index: number): string | null => {
    if (index === 1 && cleanPhone(phone).length < 10) {
      return 'Enter a valid owner phone number.';
    }
    if (index === 2 && cleanPhone(otp).length !== 6) {
      return 'Enter the 6-digit OTP.';
    }
    if (index === 3 && businessName.trim().length < 3) {
      return 'Business name must be at least 3 characters.';
    }
    if (index === 4 && (!Number.isFinite(serviceFeeNumber) || serviceFeeNumber < 0 || serviceFeeNumber > 30)) {
      return 'Service fee must be between 0% and 30%.';
    }
    if (index === 5 && (!Number.isFinite(tableCountNumber) || tableCountNumber < 1 || tableCountNumber > 99)) {
      return 'Table count must be between 1 and 99.';
    }
    if (index === 6 && menuItems.length === 0) {
      return 'Add at least one menu item.';
    }
    if (index === 7 && cleanPhone(staffPhone).length < 10) {
      return 'Enter a valid staff phone number.';
    }
    return null;
  };

  const firstInvalidStepThrough = (targetStep: number): number | null => {
    for (let index = 1; index <= Math.min(targetStep, onboardingSteps.length - 2); index += 1) {
      if (errorForStep(index)) return index;
    }
    return null;
  };

  const showValidationFor = (index: number) => {
    const message = errorForStep(index);
    if (!message) return false;
    setStep(index);
    setNotice({ tone: 'error', message });
    return true;
  };

  const next = () => {
    if (showValidationFor(step)) return;
    setNotice(null);
    setStep((current) => Math.min(onboardingSteps.length - 1, current + 1));
  };
  const back = () => {
    setNotice(null);
    setStep((current) => Math.max(0, current - 1));
  };

  const goToStep = (targetStep: number) => {
    if (targetStep <= step) {
      setNotice(null);
      setStep(targetStep);
      return;
    }
    const invalidStep = firstInvalidStepThrough(targetStep);
    if (invalidStep !== null) {
      showValidationFor(invalidStep);
      return;
    }
    setNotice(null);
    setStep(targetStep);
  };

  const finish = async () => {
    const invalidStep = firstInvalidStepThrough(onboardingSteps.length - 1);
    if (invalidStep !== null) {
      showValidationFor(invalidStep);
      return;
    }
    setNotice(null);
    try {
      await saveSetup.mutateAsync({
        businessName: businessName.trim(),
        taxEnabled,
        serviceFeePercent: serviceFeeNumber,
        tableCount: tableCountNumber,
        menuSeed: menuItems,
        staffInvites: staffPhone ? [staffPhone.trim()] : [],
      });
      setSaved(true);
      setNotice({ tone: 'success', message: 'Business setup saved. Continue to login.' });
      setStep(onboardingSteps.length - 1);
    } catch (error: any) {
      setNotice({ tone: 'error', message: error?.message || 'Could not save setup. Try again.' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.palette.neutral[50], padding: isCompact ? 12 : 24 }}>
      <View style={{ flexDirection: isCompact ? 'column' : 'row', gap: 16, flex: 1 }}>
        <Panel style={{ flex: 0.85, justifyContent: 'space-between', backgroundColor: theme.palette.neutral[900] }}>
          <View>
            <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
              <Image source={require('../../assets/bukuwarung-logo.png')} style={{ width: 64, height: 50 }} resizeMode="contain" />
            </View>
            <Text style={{ marginTop: 18, color: '#FFFFFF', fontSize: 34, lineHeight: 38, fontWeight: '900' }}>Setup BukuKasir POS</Text>
            <Text style={{ marginTop: 12, color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 21, fontWeight: '700' }}>
              Configure your store, tables, menu, staff, PIN, and first service day in one guided flow.
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            {onboardingSteps.slice(1).map((label, index) => (
              <Text key={label} style={{ color: index + 1 <= step ? '#FFFFFF' : 'rgba(255,255,255,0.42)', fontSize: 12, fontWeight: '900' }}>
                {index + 1 <= step ? '✓' : '○'} {label}
              </Text>
            ))}
          </View>
        </Panel>

        <Panel style={{ flex: 1.45 }}>
          <Stepper steps={onboardingSteps} activeIndex={step} onStep={goToStep} />
          {notice ? (
            <View
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: notice.tone === 'error' ? theme.palette.semantic.error : theme.palette.semantic.success,
                backgroundColor: notice.tone === 'error' ? theme.palette.semantic.errorBg : theme.palette.semantic.successBg,
              }}
            >
              <Text
                style={{
                  color: notice.tone === 'error' ? theme.palette.semantic.error : theme.palette.semantic.success,
                  fontSize: 12,
                  fontWeight: '900',
                }}
              >
                {notice.message}
              </Text>
            </View>
          ) : null}
          <ScrollView contentContainerStyle={{ paddingTop: 20, gap: 14 }}>
            {step === 0 ? (
              <HeroStep title="Welcome to BukuKasir" subtitle="Start with your owner phone, then we will create business setup, tables, menu seeds, and staff invites." icon={<Store size={34} color={theme.palette.brand.navy} />} />
            ) : null}
            {step === 1 ? (
              <FieldStep title="Owner phone" subtitle="Use a +62 phone for SMS/WhatsApp verification." icon={<UserPlus size={28} color={theme.palette.brand.navy} />}>
                <TextField label="+62 phone" value={phone} onChangeText={(value) => setPhone(value.replace(/\D/g, '').slice(0, 12))} keyboardType="phone-pad" />
              </FieldStep>
            ) : null}
            {step === 2 ? (
              <FieldStep title="OTP verification" subtitle="Dev/simulator mode accepts any 6 digits." icon={<Check size={28} color={theme.palette.semantic.success} />}>
                <TextField label="OTP" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" />
              </FieldStep>
            ) : null}
            {step === 3 ? (
              <FieldStep title="Business profile" subtitle="This becomes the tenant/store name used by POS and receipts." icon={<Store size={28} color={theme.palette.brand.navy} />}>
                <TextField label="Business name" value={businessName} onChangeText={setBusinessName} />
              </FieldStep>
            ) : null}
            {step === 4 ? (
              <FieldStep title="Tax and hours" subtitle="Set default charge rules. You can edit this later from Settings." icon={<Clock size={28} color={theme.palette.brand.navy} />}>
                <ToggleRow label="Tax enabled" value={taxEnabled} onToggle={() => setTaxEnabled((value) => !value)} />
                <TextField label="Service fee %" value={serviceFee} onChangeText={(value) => setServiceFee(value.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" />
              </FieldStep>
            ) : null}
            {step === 5 ? (
              <FieldStep title="Table setup" subtitle="Create the starting dining-room table count." icon={<Table2 size={28} color={theme.palette.brand.navy} />}>
                <TextField label="Table count" value={tableCount} onChangeText={(value) => setTableCount(value.replace(/\D/g, '').slice(0, 2))} keyboardType="number-pad" />
              </FieldStep>
            ) : null}
            {step === 6 ? (
              <FieldStep title="Menu seed" subtitle="Add starter menu names. Full menu editing is available later." icon={<Utensils size={28} color={theme.palette.brand.navy} />}>
                <TextField label="Menu items" value={menuSeed} onChangeText={setMenuSeed} multiline />
              </FieldStep>
            ) : null}
            {step === 7 ? (
              <FieldStep title="Staff invite" subtitle="Invite a cashier, waiter, or kitchen user by phone." icon={<UserPlus size={28} color={theme.palette.brand.navy} />}>
                <TextField label="Staff phone" value={staffPhone} onChangeText={setStaffPhone} keyboardType="phone-pad" />
              </FieldStep>
            ) : null}
            {step === 8 ? (
              <HeroStep title={saved ? 'Setup complete' : 'Ready to save'} subtitle={saved ? 'Your setup was saved. Continue to login and select a role.' : 'Review is complete. Save setup to continue.'} icon={<Check size={34} color={theme.palette.semantic.success} />} />
            ) : null}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between', marginTop: 16 }}>
            <PrimaryButton tone="light" onPress={step === 0 ? () => router.replace('/(auth)/login') : back}>
              {step === 0 ? 'Back to login' : 'Back'}
            </PrimaryButton>
            {step < 8 ? (
              <PrimaryButton onPress={next}>Continue</PrimaryButton>
            ) : saved ? (
              <PrimaryButton onPress={() => router.replace('/(auth)/login')}>Go to login</PrimaryButton>
            ) : (
              <PrimaryButton disabled={saveSetup.isPending} onPress={finish}>
                {saveSetup.isPending ? 'Saving setup...' : 'Save setup'}
              </PrimaryButton>
            )}
          </View>
        </Panel>
      </View>
    </View>
  );
}

function HeroStep({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <View style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: theme.palette.semantic.infoBg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <Text style={{ color: theme.palette.neutral[900], fontSize: 30, fontWeight: '900', textAlign: 'center' }}>{title}</Text>
      <Text style={{ maxWidth: 520, color: theme.palette.neutral[600], fontSize: 14, lineHeight: 21, fontWeight: '700', textAlign: 'center' }}>{subtitle}</Text>
    </View>
  );
}

function FieldStep({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 16, maxWidth: 560 }}>
      <View style={{ width: 58, height: 58, borderRadius: 16, backgroundColor: theme.palette.semantic.infoBg, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <SectionHeader eyebrow="Setup" title={title} />
      <Text style={{ color: theme.palette.neutral[600], fontSize: 14, lineHeight: 21, fontWeight: '700' }}>{subtitle}</Text>
      {children}
    </View>
  );
}

function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      aria-checked={value}
      testID={`onboarding-toggle-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.palette.neutral[200] }}
    >
      <Text style={{ color: theme.palette.neutral[900], fontSize: 14, fontWeight: '900' }}>{label}</Text>
      <View style={{ width: 46, height: 26, borderRadius: 13, backgroundColor: value ? theme.palette.brand.navy : theme.palette.neutral[300], padding: 3, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' }} />
      </View>
    </Pressable>
  );
}
