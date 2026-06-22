// Typography tokens. Each token exposes both
//   { fontSize, lineHeight, fontWeight }  (spread directly into Text style)
// and aliases
//   { size, lineHeight, weight }         (convenience for callers that pick fields)
// so both spellings compile.
const mk = <S extends number, L extends number, W extends '400' | '500' | '600' | '700' | '800'>(
  fontSize: S,
  lineHeight: L,
  fontWeight: W,
  extra: Record<string, unknown> = {}
) =>
  ({
    fontSize,
    lineHeight,
    fontWeight,
    size: fontSize,
    weight: fontWeight,
    ...extra,
  }) as {
    fontSize: S;
    lineHeight: L;
    fontWeight: W;
    size: S;
    weight: W;
  } & typeof extra;

export const type = {
  display: mk(32, 40, '800'),
  title: mk(24, 32, '700'),
  headline: mk(20, 28, '600'),
  body: mk(16, 24, '500'),
  caption: mk(13, 18, '500'),
  micro: mk(11, 14, '600'),
  price: mk(18, 24, '700', { fontVariant: ['tabular-nums'] as const }),
} as const;
