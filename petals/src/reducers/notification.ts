import { NotificationAction, NotificationActionType } from '../actions/notification';
import { NotificatoinState } from '../store';

const initialState: NotificatoinState = {
  message: '',
};

const notification = (state: NotificatoinState = initialState, action: NotificationAction): NotificatoinState => {
  switch (action.type) {
    case NotificationActionType.SET_MESSAGE:
      return {
        ...state,
        message: action.message,
      };

    default:
      return state;
  }
};

export default notification;
