import React from 'react';
import { View, Text, Image, type ImageSourcePropType } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { UtensilsCrossed, Plus } from 'lucide-react-native';
import { useTheme } from '../theme';
import { PressScale } from '../motion/PressScale';
import { formatRupiah } from '../lib/format';
import { getLocalMenuImageSource, resolveRemoteMenuImageUrl } from '../lib/menuImages';

interface MenuItemCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  isAvailable: boolean;
  selectedQuantity?: number;
  onPress: (id: string) => void;
}

export function MenuItemCard({
  id,
  name,
  price,
  description,
  imageUrl: _imageUrl,
  isAvailable,
  selectedQuantity = 0,
  onPress,
}: MenuItemCardProps) {
  const theme = useTheme();
  const [remoteFailed, setRemoteFailed] = React.useState(false);
  const isSelected = selectedQuantity > 0;

  // Flying dot animation (simple scale+translateY burst on press)
  const dotOpacity = useSharedValue(0);
  const dotY = useSharedValue(0);
  const dotScale = useSharedValue(0.6);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [
      { translateY: dotY.value },
      { scale: dotScale.value },
    ],
  }));

  const fireFlyingDot = () => {
    dotOpacity.value = 1;
    dotY.value = 0;
    dotScale.value = 0.6;
    dotOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 360 })
    );
    dotY.value = withTiming(-60, { duration: 440 });
    dotScale.value = withSequence(
      withTiming(1.2, { duration: 80 }),
      withTiming(0.4, { duration: 360 })
    );
  };

  const handlePress = () => {
    if (!isAvailable) return;
    fireFlyingDot();
    onPress(id);
  };

  const resolvedImageUrl = resolveRemoteMenuImageUrl(_imageUrl);
  React.useEffect(() => {
    setRemoteFailed(false);
  }, [resolvedImageUrl, id, name]);

  const fallbackImage = getLocalMenuImageSource({ id, name });
  const imageSource: ImageSourcePropType | null =
    resolvedImageUrl && !remoteFailed ? { uri: resolvedImageUrl } : fallbackImage;

  return (
    <PressScale
      onPress={handlePress}
      disabled={!isAvailable}
      accessibilityRole="button"
      accessibilityLabel={`Menu ${name} ${formatRupiah(price)}`}
      accessibilityState={{ selected: isSelected, disabled: !isAvailable }}
      aria-selected={isSelected}
      testID={`menu-card-${id}`}
      style={{
        backgroundColor: theme.palette.neutral[0],
        borderRadius: theme.radii[16],
        borderWidth: 2,
        borderColor: isSelected ? theme.palette.neutral[900] : theme.palette.neutral[200],
        overflow: 'hidden',
        minWidth: 140,
        opacity: isAvailable ? 1 : 0.55,
        ...theme.elevation.sm,
      }}
    >
      <View
        style={{
          height: 96,
          backgroundColor: theme.palette.neutral[100],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {imageSource ? (
          <Image
            source={imageSource}
            accessibilityLabel={`Foto menu ${name}`}
            testID={`menu-image-${id}`}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={() => {
              if (resolvedImageUrl && !remoteFailed) {
                setRemoteFailed(true);
              }
            }}
          />
        ) : (
          <UtensilsCrossed
            size={28}
            color={theme.palette.neutral[400]}
            strokeWidth={1.75}
          />
        )}
        <View
          style={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.palette.brand.navy,
            alignItems: 'center',
            justifyContent: 'center',
            ...theme.elevation.sm,
          }}
        >
          <Plus size={16} color={theme.palette.brand.gold} strokeWidth={2.5} />
        </View>
      </View>

      <View style={{ padding: theme.spacing[12] }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: theme.type.headline.size,
            lineHeight: theme.type.headline.lineHeight,
            fontWeight: '700',
            color: theme.palette.neutral[900],
            marginBottom: 2,
          }}
        >
          {name}
        </Text>
        {description ? (
          <Text
            numberOfLines={1}
            style={{
              fontSize: theme.type.micro.size,
              color: theme.palette.neutral[500],
              marginBottom: 6,
            }}
          >
            {description}
          </Text>
        ) : (
          <View style={{ height: 6 }} />
        )}
        <Text
          style={{
            fontSize: theme.type.price.size,
            lineHeight: theme.type.price.lineHeight,
            fontWeight: theme.type.price.weight,
            color: theme.palette.brand.navy,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatRupiah(price)}
        </Text>
      </View>

      {isSelected ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            minWidth: 28,
            height: 28,
            paddingHorizontal: 8,
            borderRadius: 14,
            backgroundColor: theme.palette.neutral[900],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: theme.palette.neutral[0], fontSize: theme.type.micro.size, fontWeight: '900' }}>
            x{selectedQuantity}
          </Text>
        </View>
      ) : null}

      {/* Flying dot overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 40,
            alignSelf: 'center',
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.palette.semantic.success,
          },
          dotStyle,
        ]}
      />

      {!isAvailable ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: theme.palette.semantic.error,
            borderRadius: theme.radii[4],
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          <Text
            style={{
              fontSize: theme.type.micro.size,
              fontWeight: '700',
              color: theme.palette.neutral[0],
            }}
          >
            Habis
          </Text>
        </View>
      ) : null}
    </PressScale>
  );
}
