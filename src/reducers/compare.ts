import {
  ACTION_INIT_COMPARE,
  ACTION_STEP_COMPARE,
  ACTION_FINISH_COMPARE,
  ACTION_CLEAR_COMPARE,
  ACTION_REPLACE_ANSWERS,
  ACTION_SET_ANSWER,
  IActionInitCompare,
  IActionStepCompare,
  IActionFinishCompare,
  IActionClearCompare,
  IActionReplaceAnswers,
  IActionSetAnswer,
} from '../actions/compare';
import update from 'immutability-helper';
import { IAnswersState } from './answers';

export interface ICompareState {
  role: string | null,
  step: string | null,
  crypto: string | null,
  output: string | null,
  result: IAnswersState | null,
}
export function compare(
  state: ICompareState = {
    role: null,
    step: null,
    crypto: null,
    output: null,
    result: null,
  },
  action: IActionInitCompare | IActionStepCompare | IActionFinishCompare | IActionClearCompare | IActionReplaceAnswers | IActionSetAnswer,
) {
  switch (action.type) {
    case ACTION_INIT_COMPARE:
      return update(state, {
        $set: {
          role: action.isAlice ? 'alice' : 'bob',
          step: action.isAlice ? 'garble' : 'init',
          crypto: action.crypto,
          output: action.output,
          result: null,
        },
      });
    case ACTION_STEP_COMPARE:
      return update(state, {
        $merge: {
          step: state.role === 'alice' ? 'receive' : 'inquiry',
          crypto: action.crypto,
          output: action.output,
          result: null,
        },
      });
    case ACTION_FINISH_COMPARE:
      return update(state, {
        $merge: {
          step: 'done',
          crypto: null,
          output: null,
          result: action.result,
        },
      });
    case ACTION_CLEAR_COMPARE:
    case ACTION_REPLACE_ANSWERS:
    case ACTION_SET_ANSWER:
      return update(state, {
        $set: {
          role: null,
          step: null,
          crypto: null,
          output: null,
          result: null,
        }
      });
    default:
      return state;
  }
}
