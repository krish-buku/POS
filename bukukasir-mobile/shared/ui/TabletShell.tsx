import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { BatteryMedium, Clock, Wifi } from 'lucide-react-native';
import { useTheme } from '../theme';
import { ProfileMenu } from '../components/ProfileMenu';

type RoleName = 'cashier' | 'waiter' | 'kitchen';

interface TabletShellProps {
  role: RoleName;
  title: string;
  subtitle?: string;
  businessName?: string;
  staffName?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

export function TabletShell({
  role,
  title,
  subtitle,
  businessName,
  staffName,
  trailing,
  children,
}: TabletShellProps) {
  const theme = useTheme();
  const roleColor = theme.palette.roles[role];

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.palette.neutral[50] }}
      edges={['top', 'left', 'right']}
    >
      <View
        style={{
          height: 72,
          paddingHorizontal: 18,
          backgroundColor: roleColor,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '900' }}>
            {title}
          </Text>
          <Text numberOfLines={1} style={{ color: 'rgba(255,255,255,0.78)', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
            {subtitle ?? `${businessName ?? 'BukuKasir'}${staffName ? ` · ${staffName}` : ''}`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <HeaderBadge icon={<Wifi size={13} color="#FFFFFF" />} label="Online" />
          <HeaderBadge icon={<Clock size={13} color="#FFFFFF" />} label={new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} />
          <HeaderBadge icon={<BatteryMedium size={13} color="#FFFFFF" />} label="Tablet" />
          {trailing ?? <ProfileMenu />}
        </View>
      </View>
      {children}
    </SafeAreaView>
  );
}

function HeaderBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.24)',
        backgroundColor: 'rgba(255,255,255,0.14)',
        paddingHorizontal: 9,
        paddingVertical: 6,
      }}
    >
      {icon}
      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}
