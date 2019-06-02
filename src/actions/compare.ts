import { IAnswersState } from '../reducers/answers';

export const ACTION_START_COMPARE = 'C_START_COMPARE';
export const ACTION_CLEAR_COMPARE = 'C_CLEAR_COMPARE';
export interface IActionStartCompare {
  type: typeof ACTION_START_COMPARE;
  s: IAnswersState;
  m: IAnswersState;
}
export interface IActionClearCompare {
  type: typeof ACTION_CLEAR_COMPARE;
}
export function createStartCompareAction(
  o: IAnswersState,
  b: IAnswersState,
  reversed: boolean,
): IActionStartCompare {
  return {
    type: ACTION_START_COMPARE,
    o,
    b,
    reversed,
  };
}
export function createClearCompareAction(): IActionClearCompare {
  return {
    type: ACTION_CLEAR_COMPARE,
  };
}
