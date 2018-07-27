import {createStore, applyMiddleware, compose} from 'redux';
import reducers from '../reducers';
import {createLogger} from 'redux-logger';

const loggerMiddleware = createLogger();

const configureStore = initialState => {
  const enhancer = compose(
    applyMiddleware(
      loggerMiddleware,
    )
  );
  return createStore(reducers, initialState, enhancer);
};


const store = configureStore({});
export default store;

