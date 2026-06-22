export enum ImpactFeedbackStyle {
  Light = 'light',
  Medium = 'medium',
  Heavy = 'heavy',
  Rigid = 'rigid',
  Soft = 'soft',
}

export enum NotificationFeedbackType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
}

export async function selectionAsync() {
  return undefined;
}

export async function impactAsync(_style?: ImpactFeedbackStyle) {
  return undefined;
}

export async function notificationAsync(_type?: NotificationFeedbackType) {
  return undefined;
}

export default {
  ImpactFeedbackStyle,
  NotificationFeedbackType,
  selectionAsync,
  impactAsync,
  notificationAsync,
};
