import React from 'react';
import { Text, View } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useTheme } from '../theme';
import { useT } from '../i18n/store';

interface SyncBannerProps {
  offline?: boolean;
  pendingCount?: number;
  failedCount?: number;
  label?: string;
}

export function SyncBanner({
  offline = false,
  pendingCount = 0,
  failedCount = 0,
  label,
}: SyncBannerProps) {
  const theme = useTheme();
  const t = useT();
  const tone = failedCount > 0 || offline ? theme.palette.semantic.warning : theme.palette.semantic.success;
  const bg = failedCount > 0 || offline ? theme.palette.semantic.warningBg : theme.palette.semantic.successBg;
  const Icon = offline ? WifiOff : Wifi;
  const text =
    label ??
    (offline
      ? `${t('sync.offline')} · ${pendingCount} ${t('sync.queue')}`
      : failedCount > 0
        ? `${failedCount} ${t('sync.failed')}`
        : pendingCount > 0
          ? `${pendingCount} ${t('sync.pending')}`
          : t('sync.online'));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: bg,
        borderColor: tone,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Icon size={15} color={tone} strokeWidth={2.4} />
      <Text style={{ color: theme.palette.neutral[800], fontSize: 12, fontWeight: '700' }}>
        {text}
      </Text>
    </View>
  );
}
