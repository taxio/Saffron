import {
  LOGIN,
  LOGOUT,
} from '../actions/types';

const initialState = {
  isLogin: false,
  token: null,
};

const account = (state = initialState, action) => {
  switch (action.type){
    case LOGIN:
      return {
        ...state,
        isLogin: true,
        token: action.token
      };

    case LOGOUT:
      return {
        ...state,
        isLogin: false,
        token: null,
      };

    default:
      return state;
  }
};

export default account;
