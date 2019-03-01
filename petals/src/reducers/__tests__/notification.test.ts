import { NotificationActionType, SetMessageNotificationAction } from '../../actions/notification';
import { NotificatoinState } from '../../store';
import notification from '../notification';

describe('notification reducer', () => {
  const initialState: NotificatoinState = {
    message: '',
  };

  it('set message', () => {
    const action: SetMessageNotificationAction = {
      type: NotificationActionType.SET_MESSAGE,
      message: 'hoge',
    };
    const want: NotificatoinState = {
      message: 'hoge',
    };
    expect(notification(initialState, action)).toEqual(want);
  });

  it('clear message', () => {
    const prevState = { ...initialState, message: 'foo' };
    const action: SetMessageNotificationAction = {
      type: NotificationActionType.SET_MESSAGE,
      message: '',
    };
    const want: NotificatoinState = {
      message: '',
    };
    expect(notification(prevState, action)).toEqual(want);
  });
});
