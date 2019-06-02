import {
  ACTION_CLEAR_COMPARE,
  ACTION_START_COMPARE,
  IActionClearCompare,
  IActionSetCompareForm,
  IActionStartCompare,
} from '../actions/compare';
import update from 'immutability-helper';
import { IAnswersState } from './answers';

export interface ICompareState {
  comparing: null | {
    o: IAnswersState,
    b: IAnswersState,
    reversed: boolean,
  };
}
export function compare(
  state: ICompareState = {
    comparing: null,
  },
  action: IActionSetCompareForm | IActionStartCompare | IActionClearCompare,
) {
  switch (action.type) {
    case ACTION_START_COMPARE:
      return update(state, {
        comparing: {
          $set: {
            o: action.o,
            b: action.b,
            reversed: action.reversed,
          },
        },
      });
    case ACTION_CLEAR_COMPARE:
      return update(state, {
        comparing: {
          $set: null,
        },
      });
    default:
      return state;
  }
}
