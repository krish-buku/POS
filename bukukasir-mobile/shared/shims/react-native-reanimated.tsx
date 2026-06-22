import React from 'react';
import { Animated as RNAnimated } from 'react-native';

type SharedValue<T> = { value: T };

const identity = (value: number) => value;
const easing = Object.assign(identity, {
  out: () => identity,
  in: () => identity,
  inOut: () => identity,
  bezier: () => identity,
  cubic: identity,
  quad: identity,
  ease: identity,
});

function lastValue(values: unknown[]) {
  return values.length > 0 ? values[values.length - 1] : undefined;
}

export const Easing = easing;

export function useSharedValue<T>(initial: T): SharedValue<T> {
  return React.useRef<SharedValue<T>>({ value: initial }).current;
}

export function useAnimatedStyle<T extends object>(factory: () => T): T {
  void factory;
  return {} as T;
}

export function useDerivedValue<T>(factory: () => T): SharedValue<T> {
  return { value: factory() };
}

export function useAnimatedReaction<T>(
  prepare: () => T,
  react: (value: T, previous: T | null) => void,
  deps: React.DependencyList = [],
) {
  React.useEffect(() => {
    react(prepare(), null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function withTiming<T>(toValue: T, _config?: unknown, callback?: (finished?: boolean) => void): T {
  callback?.(true);
  return toValue;
}

export function withDelay<T>(_delayMs: number, value: T): T {
  return value;
}

export function withSequence<T>(...values: T[]): T {
  return lastValue(values) as T;
}

export function withRepeat<T>(value: T): T {
  return value;
}

export function runOnJS<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
  return handler;
}

export function useHandler() {
  return { context: {}, doDependenciesDiffer: false, useWeb: false };
}

export function interpolate(value: number, input: number[], output: number[]): number {
  if (input.length < 2 || output.length < 2) return output[0] ?? value;
  const start = input[0];
  const end = input[input.length - 1];
  const outStart = output[0];
  const outEnd = output[output.length - 1];
  const ratio = end === start ? 0 : Math.max(0, Math.min(1, (value - start) / (end - start)));
  return outStart + (outEnd - outStart) * ratio;
}

export function interpolateColor<T>(value: number, input: number[], output: T[]): T {
  return value >= input[input.length - 1] ? output[output.length - 1] : output[0];
}

export const FadeIn = RNAnimated.View;
export const FadeOut = RNAnimated.View;

const Animated = Object.assign(RNAnimated, {
  useEvent,
  useHandler,
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useAnimatedReaction,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  runOnJS,
  interpolate,
  interpolateColor,
  Easing,
});

export default Animated;
