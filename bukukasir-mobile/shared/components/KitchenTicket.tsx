import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../theme';
import { arr } from '../lib/safe';
import { PressScale } from '../motion/PressScale';
import { formatElapsed, getElapsedMinutes } from '../lib/format';
import type { KitchenTicketStatus, TableStatus } from '../constants/colors';
import { useT } from '../i18n/store';

interface KitchenTicketProps {
  id: string;
  orderNumber: string;
  tableName: string;
  tableStatus?: TableStatus;
  items: {
    id: string;
    name: string;
    quantity: number;
    modifiers: string[] | null | undefined;
    notes: string;
  }[];
  status: KitchenTicketStatus;
  createdAt: string;
  onAdvance: (id: string) => void;
  onLongAdvance?: (id: string) => void;
  onMoveBack?: (id: string) => void;
}

// PRD: green < 10min, yellow 10-20min, red > 20min
function getTimingTone(
  minutes: number,
  theme: ReturnType<typeof useTheme>
): { fg: string; bg: string } {
  if (minutes < 10) {
    return {
      fg: theme.palette.semantic.success,
      bg: theme.palette.semantic.successBg,
    };
  }
  if (minutes < 20) {
    return {
      fg: theme.palette.semantic.warning,
      bg: theme.palette.semantic.warningBg,
    };
  }
  return {
    fg: theme.palette.semantic.error,
    bg: theme.palette.semantic.errorBg,
  };
}

function getStatusMeta(
  status: KitchenTicketStatus | string | undefined | null,
  theme: ReturnType<typeof useTheme>,
  t: ReturnType<typeof useT>
) {
  const normalized = String(status || 'new').toLowerCase();
  switch (normalized) {
    case 'preparing':
      return {
        label: t('kitchen.ticket.serveReady'),
        color: theme.palette.semantic.warning,
        stepIndex: 1,
      };
    case 'ready':
      return {
        label: t('kitchen.ticket.done'),
        color: theme.palette.semantic.success,
        stepIndex: 2,
      };
    case 'new':
    default:
      return {
        label: t('kitchen.ticket.startCooking'),
        color: theme.palette.semantic.info,
        stepIndex: 0,
      };
  }
}

export function KitchenTicket({
  id,
  orderNumber,
  tableName,
  items,
  status,
  createdAt,
  onAdvance,
  onLongAdvance,
  onMoveBack,
}: KitchenTicketProps) {
  const theme = useTheme();
  const t = useT();

  const [elapsedLabel, setElapsedLabel] = useState(formatElapsed(createdAt));
  const [minutes, setMinutes] = useState(getElapsedMinutes(createdAt));

  useEffect(() => {
    const iv = setInterval(() => {
      setElapsedLabel(formatElapsed(createdAt));
      setMinutes(getElapsedMinutes(createdAt));
    }, 1000);
    return () => clearInterval(iv);
  }, [createdAt]);

  const normalizedStatus = String(status || 'new').toLowerCase() as KitchenTicketStatus;

  // Elevation tween on status change
  const elev = useSharedValue(0);
  useEffect(() => {
    elev.value = withTiming(
      normalizedStatus === 'preparing'
        ? 1
        : normalizedStatus === 'ready'
          ? 0.5
          : 0,
      { duration: theme.motion.duration.normal }
    );
  }, [normalizedStatus]);

  const elevStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.05 + elev.value * 0.08,
    shadowRadius: 6 + elev.value * 14,
    shadowOffset: { width: 0, height: 3 + elev.value * 4 },
    elevation: 2 + elev.value * 6,
  }));

  // Subtle pulse when overdue
  const pulse = useSharedValue(0);
  const overdue = minutes >= 20 && normalizedStatus !== 'ready';
  useEffect(() => {
    if (overdue) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [overdue]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + pulse.value * 0.45,
  }));

  const timing = getTimingTone(minutes, theme);
  const meta = getStatusMeta(normalizedStatus, theme, t);

  // Press-and-hold 500ms to advance
  const holdTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const startHold = () => {
    holdTimerRef.current = setTimeout(() => {
      if (onLongAdvance) onLongAdvance(id);
      else onAdvance(id);
    }, 500);
  };
  const cancelHold = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    holdTimerRef.current = null;
  };

  const itemList = arr(items);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.palette.neutral[0],
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.palette.neutral[200],
          marginBottom: 10,
          overflow: 'hidden',
          shadowColor: '#000',
        },
        elevStyle,
      ]}
    >
      {/* Accent stripe on top */}
      <View style={{ height: 3, backgroundColor: meta.color }} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 8,
          gap: 10,
        }}
      >
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 11,
              fontWeight: '600',
              color: theme.palette.neutral[500],
              letterSpacing: 0.4,
            }}
          >
            {orderNumber}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 2,
              gap: 6,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: theme.palette.neutral[900],
                letterSpacing: -0.3,
              }}
            >
              {tableName || '—'}
            </Text>
          </View>
        </View>

        {/* Timer pill */}
        <View
          style={{
            position: 'relative',
          }}
        >
          {overdue ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: 14,
                  backgroundColor: timing.fg,
                },
                pulseStyle,
              ]}
            />
          ) : null}
          <View
            style={{
              backgroundColor: timing.bg,
              borderRadius: 10,
              paddingHorizontal: 10,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderWidth: 1,
              borderColor: timing.fg + '33',
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: timing.fg,
              }}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '800',
                color: timing.fg,
                fontVariant: ['tabular-nums'],
                letterSpacing: 0.2,
              }}
            >
              {elapsedLabel}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress dots */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 12,
          gap: 4,
          marginBottom: 8,
        }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor:
                i <= meta.stepIndex
                  ? meta.color
                  : theme.palette.neutral[200],
            }}
          />
        ))}
      </View>

      {/* Items */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: theme.palette.neutral[50],
          borderTopWidth: 1,
          borderTopColor: theme.palette.neutral[100],
        }}
      >
        {itemList.length === 0 ? (
          <Text
            style={{
              fontSize: 12,
              color: theme.palette.neutral[500],
              fontStyle: 'italic',
            }}
          >
            {t('kitchen.ticket.noItems')}
          </Text>
        ) : (
          itemList.map((item, idx) => {
            const modifiers = arr(item.modifiers);
            const label =
              item.name && String(item.name).trim().length > 0
                ? item.name
                : t('receipt.item');
            return (
              <View
                key={item.id || idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    backgroundColor: theme.palette.brand.navy,
                    borderRadius: 6,
                    paddingHorizontal: 7,
                    paddingVertical: 2,
                    marginRight: 10,
                    minWidth: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: '#FFFFFF',
                      fontVariant: ['tabular-nums'],
                      letterSpacing: 0.3,
                    }}
                  >
                    {item.quantity}×
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: theme.palette.neutral[900],
                      lineHeight: 18,
                    }}
                  >
                    {label}
                  </Text>
                  {modifiers.length > 0 ? (
                    <Text
                      numberOfLines={2}
                      style={{
                        fontSize: 12,
                        color: theme.palette.neutral[600],
                        marginTop: 2,
                      }}
                    >
                      + {modifiers.join(', ')}
                    </Text>
                  ) : null}
                  {item.notes ? (
                    <View
                      style={{
                        marginTop: 4,
                        backgroundColor: 'rgba(245,158,11,0.12)',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 4,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontStyle: 'italic',
                          color: theme.palette.semantic.warning,
                          fontWeight: '600',
                        }}
                      >
                        {'\u270E '}{item.notes}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Action */}
      <View style={{ flexDirection: 'row', margin: 10, marginTop: 10, gap: 8, alignItems: 'stretch' }}>
        {onMoveBack && normalizedStatus !== 'new' ? (
          <PressScale
            onPress={() => onMoveBack(id)}
            accessibilityRole="button"
            accessibilityLabel={`Move ${orderNumber} back`}
            style={{
              width: 48,
              minHeight: 48,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: theme.palette.neutral[100],
              borderWidth: 1,
              borderColor: theme.palette.neutral[300],
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Text style={{ color: theme.palette.neutral[700], fontSize: 14, fontWeight: '800' }}>
              {'\u2190'}
            </Text>
          </PressScale>
        ) : null}

        {normalizedStatus !== 'ready' ? (
          <PressScale
            onPress={() => onAdvance(id)}
            onPressIn={startHold}
            onPressOut={cancelHold}
            accessibilityRole="button"
            accessibilityLabel={`${meta.label} ${orderNumber}`}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 48,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              alignItems: 'center',
              backgroundColor: meta.color,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              style={{
                flexShrink: 1,
                minWidth: 0,
                color: '#FFFFFF',
                fontSize: 14,
                lineHeight: 18,
                fontWeight: '900',
                textAlign: 'center',
              }}
            >
              {meta.label}
            </Text>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'rgba(255,255,255,0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900', lineHeight: 18 }}>
                {'\u2192'}
              </Text>
            </View>
          </PressScale>
        ) : (
          <View
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 48,
              paddingVertical: 10,
              paddingHorizontal: 12,
              alignItems: 'center',
              backgroundColor: 'rgba(16,185,129,0.12)',
              borderRadius: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
              style={{
                flexShrink: 1,
                minWidth: 0,
                fontSize: 13,
                lineHeight: 18,
                fontWeight: '900',
                letterSpacing: 0.8,
                color: theme.palette.semantic.success,
                textAlign: 'center',
              }}
            >
              {'\u2713'} {t('kitchen.ticket.readyToServe')}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
