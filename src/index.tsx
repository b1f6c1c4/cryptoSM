import { Cover } from './components/Cover';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import { deflate, inflate } from 'pako';
import _get from 'lodash/get';
import _set from 'lodash/set';
import { decode, encode } from './persistence';
import { reducers } from './reducers/index';
import { IRootState } from './RootState';
import './i18n';
import 'typeface-poiret-one';

const theEncodedAnswers = window.localStorage.getItem('encodedAnswers');
const theEncodedComparison = window.localStorage.getItem('encodedComparison');
const theEncodedCrypto = window.localStorage.getItem('encodedCrypto');

const init = {};
if (theEncodedAnswers) {
  init.answers = decode(theEncodedAnswers as string);
  if (theEncodedComparison) {
    init.compare = JSON.parse(theEncodedComparison);
    if (init.compare.crypto && theEncodedCrypto) {
      // TODO
      // init.compare.crypto.mem = inflate(theEncodedCrypto);
    }
  }
}

class App extends React.Component {
  public shouldComponentUpdate() {
    return false;
  }
  private store = createStore(
    reducers,
    init,
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
      applyMiddleware(store => next => action => {
        const previousAnswers = (store.getState() as IRootState).answers;
        const previousComparison = (store.getState() as IRootState).compare;
        const result = next(action);
        const currentAnswers = (store.getState() as IRootState).answers;
        const currentComparison = (store.getState() as IRootState).compare;
        if (currentAnswers !== previousAnswers) {
          window.localStorage.setItem(
            'encodedAnswers',
            encode(currentAnswers),
          );
        }
        if (currentComparison !== previousComparison) {
          const mem = _get(currentComparison, ['crypto', 'mem']);
          if (mem) {
            window.localStorage.setItem(
              'encodedCrypto',
              // deflate(mem, { to: 'string' }),
            );
          } else {
            window.localStorage.removeItem('encodedCrypto');
          }
          window.localStorage.setItem(
            'encodedComparison',
            JSON.stringify(currentComparison),
          );
        }
      },
    )),
  );
  public render() {
    return (
      <Provider store={ this.store }>
        <Cover/>
      </Provider>
    );
  }
}

render(<App/>, document.getElementById('root'));
