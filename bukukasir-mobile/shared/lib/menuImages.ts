import type { ImageSourcePropType } from 'react-native';

const images: Record<string, ImageSourcePropType> = {
  'nasi-goreng': require('../../assets/menu/nasi-goreng.png'),
  'mie-goreng': require('../../assets/menu/mie-goreng.png'),
  'ayam-bakar': require('../../assets/menu/ayam-bakar.png'),
  'soto-ayam': require('../../assets/menu/soto-ayam.png'),
  'es-teh-manis': require('../../assets/menu/es-teh-manis.png'),
  'es-jeruk': require('../../assets/menu/es-jeruk.png'),
  'kopi-hitam': require('../../assets/menu/kopi-hitam.png'),
  'kopi-susu': require('../../assets/menu/kopi-susu.png'),
  'kentang-goreng': require('../../assets/menu/kentang-goreng.png'),
  'pisang-goreng': require('../../assets/menu/pisang-goreng.png'),
  'tahu-goreng': require('../../assets/menu/tahu-goreng.png'),
  'es-campur': require('../../assets/menu/es-campur.png'),
};

function normalize(value: string | null | undefined): string {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getLocalMenuImageSource(item: {
  id?: string | null;
  name?: string | null;
}): ImageSourcePropType | null {
  const id = normalize(item.id);
  const name = normalize(item.name);
  const haystack = `${id} ${name}`;

  if (id === 'menu-001' || haystack.includes('nasi-goreng')) return images['nasi-goreng'];
  if (id === 'menu-002' || haystack.includes('mie-goreng')) return images['mie-goreng'];
  if (id === 'menu-003' || haystack.includes('ayam-bakar')) return images['ayam-bakar'];
  if (id === 'menu-004' || haystack.includes('soto-ayam')) return images['soto-ayam'];
  if (id === 'menu-005' || haystack.includes('es-teh')) return images['es-teh-manis'];
  if (id === 'menu-006' || haystack.includes('es-jeruk')) return images['es-jeruk'];
  if (haystack.includes('kopi-susu')) return images['kopi-susu'];
  if (id === 'menu-007' || haystack.includes('kopi-hitam') || haystack.includes('kopi')) {
    return images['kopi-hitam'];
  }
  if (haystack.includes('kentang')) return images['kentang-goreng'];
  if (haystack.includes('pisang')) return images['pisang-goreng'];
  if (id === 'menu-009' || haystack.includes('tahu')) return images['tahu-goreng'];
  if (id === 'menu-010' || haystack.includes('es-campur')) return images['es-campur'];

  return null;
}

export function resolveRemoteMenuImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== 'string') return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|file:)/i.test(trimmed)) return trimmed;

  const base = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8080';
  return trimmed.startsWith('/') ? `${base}${trimmed}` : `${base}/${trimmed}`;
}
