import * as model from '../model';

export enum UserActionType {
  USER_FETCH_REQUESTED = 'USER_FETCH_REQUESTED',
  UESR_UPDATE_REQUESTED = 'UESR_UPDATE_REQUESTED',
  USER_FETCH_SUCCEEDED = 'USER_FETCH_SUCCEEDED',
  USER_FETCH_FAILED = 'USER_FETCH_FAILED',
}

export interface UserFetchRequestedAction {
  type: UserActionType.USER_FETCH_REQUESTED;
}

export const userFetchRequest = (): UserFetchRequestedAction => ({
  type: UserActionType.USER_FETCH_REQUESTED,
});

export interface UserUpdateRequestedAction {
  type: UserActionType.UESR_UPDATE_REQUESTED;
  screenName: string | null;
  gpa: number | null;
}

export const userUpdateRequest = (
  screenName: string | null = null,
  gpa: number | null = null
): UserUpdateRequestedAction => ({
  type: UserActionType.UESR_UPDATE_REQUESTED,
  screenName,
  gpa,
});

export interface UserFetchSucceededAction {
  type: UserActionType.USER_FETCH_SUCCEEDED;
  user: model.User;
}

export const userFetchSucceeded = (user: model.User): UserFetchSucceededAction => ({
  type: UserActionType.USER_FETCH_SUCCEEDED,
  user,
});

export interface UserFetchFailedAction {
  type: UserActionType.USER_FETCH_FAILED;
  error: Error;
}

export const UserFetchFailed = (error: Error): UserFetchFailedAction => ({
  type: UserActionType.USER_FETCH_FAILED,
  error,
});

export type UserAction =
  | UserFetchRequestedAction
  | UserUpdateRequestedAction
  | UserFetchSucceededAction
  | UserFetchFailedAction;
