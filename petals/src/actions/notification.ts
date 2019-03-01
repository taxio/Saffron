export enum NotificationActionType {
  SET_MESSAGE = 'SET_MESSAGE',
}

export interface SetMessageNotificationAction {
  type: NotificationActionType.SET_MESSAGE;
  message: string;
}

export const setMessage = (message: string): SetMessageNotificationAction => ({
  type: NotificationActionType.SET_MESSAGE,
  message,
});

export type NotificationAction = SetMessageNotificationAction;
