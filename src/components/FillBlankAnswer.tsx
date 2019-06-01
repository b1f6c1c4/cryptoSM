import { accessAnswerByIndex } from '../AccessAnswer';
import { createSetAnswerAction, FBAnswer } from '../actions/answers';
import { ICategory, IFillBlankQuestion } from '../data/categories';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { IRootState } from '../RootState';
import { InputField } from './InputField';

interface IFillBlankAnswerOwnProps {
  readonly categoryIndex: number;
  readonly category: ICategory;
  readonly questionIndex: number;
  readonly question: IFillBlankQuestion;
  readonly bianswer: boolean;
  readonly showS: boolean;
  readonly showM: boolean;
}
interface IFillBlankAnswerProps extends IFillBlankAnswerOwnProps {
  readonly currentAnswer: FBAnswer;
  readonly setAnswer: typeof createSetAnswerAction;
}
class FillBlankAnswerUW extends React.PureComponent<
  IFillBlankAnswerProps
> {
  private setAnswer = (answer: FBAnswer) => {
    this.props.setAnswer(
      this.props.category.categoryId,
      this.props.question.questionId,
      answer,
    );
  }
  private readonly onChange0 = (newValue: string) => {
    if (this.props.bianswer) {
      this.setAnswer([
        newValue,
        this.props.currentAnswer[1],
      ]);
    } else {
      this.setAnswer(newValue);
    }
  }
  private readonly onChange1 = (newValue: string) => {
    this.setAnswer([
      this.props.currentAnswer[0],
      newValue,
    ]);
  }
  public render() {
    const t = this.props.t;
    const showCol0 = !this.props.bianswer || this.props.showS;
    const showCol1 = this.props.bianswer && this.props.showM;
    return (
      <div>
        { showCol0 && <InputField
          label={ this.props.bianswer
            ? t('lab.sm.fbq.asS', { q: t(this.props.question.label) })
            : this.props.question.label
          }
          value={
            Array.isArray(this.props.currentAnswer)
              ? this.props.currentAnswer[0]
              : this.props.currentAnswer
          }
          onChange={ this.onChange0 }
        /> }
        { showCol1 && <InputField
          label={ t('lab.sm.fbq.asM', { q: t(this.props.question.label) }) }
          value={ this.props.currentAnswer[1] }
          onChange={ this.onChange1 }
        /> }
      </div>
    );
  }
}

export const FillBlankAnswer = withTranslation()(connect((
  state: IRootState,
  ownProps: IFillBlankAnswerOwnProps,
) => ({
  currentAnswer: accessAnswerByIndex(
    state.answers,
    ownProps.categoryIndex,
    ownProps.questionIndex,
  ),
}), {
  setAnswer: createSetAnswerAction,
})(FillBlankAnswerUW));
