import { IAnswersState } from '../reducers/answers';

export const ACTION_INIT_COMPARE = 'C_INIT_COMPARE';
export const ACTION_STEP_COMPARE = 'C_STEP_COMPARE';
export const ACTION_FINISH_COMPARE = 'C_FINISH_COMPARE';
export const ACTION_CLEAR_COMPARE = 'C_CLEAR_COMPARE';
export interface IActionInitCompare {
  type: typeof ACTION_INIT_COMPARE;
  isAlice: boolean;
  crypto: string;
  output: string;
}
export interface IActionStepCompare {
  type: typeof ACTION_STEP_COMPARE;
  crypto: string;
  output: string;
}
export interface IActionFinishCompare {
  type: typeof ACTION_FINISH_COMPARE;
  result: IAnswersState;
}
export interface IActionClearCompare {
  type: typeof ACTION_CLEAR_COMPARE;
}
export function createInitCompareAction(
  isAlice: boolean,
  crypto: string,
  output: string,
): IActionInitCompare {
  return {
    type: ACTION_INIT_COMPARE,
    isAlice,
    crypto,
    output,
  };
}
export function createStepCompareAction(
  crypto: string,
  output: string,
): IActionStartCompare {
  return {
    type: ACTION_STEP_COMPARE,
    crypto,
    output,
  };
}
export function createFinishCompareAction(
  result: IAnswersState,
): IActionFinishCompare {
  return {
    type: ACTION_FINISH_COMPARE,
    result,
  };
}
export function createClearCompareAction(): IActionClearCompare {
  return {
    type: ACTION_CLEAR_COMPARE,
  };
}
