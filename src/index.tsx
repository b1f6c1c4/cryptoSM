import { Cover } from './components/Cover';
import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { useTranslation, initReactI18next } from 'react-i18next';
import { decode, encode } from './persistence';
import { reducers } from './reducers/index';
import { IRootState } from './RootState';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          'lab.sm.about.openSource.title': 'edit',
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const getEncodedAnswers = () => window.localStorage.getItem('encodedAnswers');

class App extends React.Component {
  public shouldComponentUpdate() {
    return false;
  }
  private store = createStore(
    reducers,
    getEncodedAnswers() === null
      ? {}
      : {
        answers: decode(getEncodedAnswers() as string),
      },
    ((window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose)(
      applyMiddleware(store => next => action => {
        const previousAnswers = (store.getState() as IRootState).answers;
        const result = next(action);
        const currentAnswers = (store.getState() as IRootState).answers;
        if (currentAnswers !== previousAnswers) {
          window.localStorage.setItem(
            'encodedAnswers',
            encode(currentAnswers),
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
