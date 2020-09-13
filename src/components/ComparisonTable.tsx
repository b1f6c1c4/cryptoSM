import { withTranslation } from 'react-i18next';
import { accessAnswerById } from '../AccessAnswer';
import {
  getBianswerQuestionDisplayInfo,
  getNonBianswerQuestionDisplayInfo,
} from '../contents/Profile';
import {
  categories,
  ICategory,
  IQuestion,
  QuestionType,
} from '../data/categories';
import * as React from 'react';
import { IAnswersState } from '../reducers/answers';
import { LinkButton } from './LinkButton';

interface IComparisonTableProps {
  readonly basic: boolean;
  readonly my: IAnswersState;
  readonly partner: IAnswersState;
  readonly reversed: boolean;
}
interface IComparisonTableState {
  readonly showAll: boolean;
}
class ComparisonTableUW extends React.PureComponent<
  IComparisonTableProps,
  IComparisonTableState
> {
  public state = {
    showAll: false,
  };
  private onClickSwitchShowMode = () => {
    this.setState(state => ({
      showAll: !state.showAll,
    }));
  }
  private convertAnswerToSchrodinger(
    question: IQuestion,
    answerRaw: any,
  ): string | null {
    if (answerRaw === null || answerRaw === '') {
      return null;
    } else if (question.type === QuestionType.MULTIPLE_CHOICE) {
      return question.choices[answerRaw];
    } else {
      return answerRaw;
    }
  }
  private convertSchrodingerToElement(schrodinger: string | null | undefined, raw: number | undefined) {
    const t = this.props.t;
    if (schrodinger) {
      const color = raw === undefined ? undefined : `rgb(255,255,${255 - (3 - raw) * (3 - raw) * 13})`;
      return <td style={{
        background: color,
      }}>{ t(schrodinger) }</td>;
    } else if (schrodinger === null) {
      return <td className='empty'>{ '< ' + t('lab.sm.compare.table.empty') + ' >' }</td>;
    } else {
      return (
        <td className='unavailable'>
          { '< ' + t('lab.sm.compare.table.unavailable') + ' >' }
        </td>
      );
    }
  }
  private renderRows(): Array<React.ReactNode> {
    const t = this.props.t;
    const basic = this.props.basic;
    const lAnswers = basic ? { [0]: this.props.my } : this.props.my;
    const rAnswers = basic ? { [0]: this.props.partner } : this.props.partner;
    const results: Array<React.ReactNode> = [];
    const showAll = this.state.showAll;
    for (const category of categories) {
      const cid = category.categoryId;
      if (basic && cid) continue;
      if (!basic && !cid) continue;

      for (const question of category.questions) {
        const qid = question.questionId;

        let lAnswerRaw: string | number | null = null;
        let rAnswerRaw: string | number | null = null;

        // null = empty
        // undefined = unavailable
        let lAnswer: string | null | undefined;
        let rAnswer: string | null | undefined;

        if (basic) {
          if (question.bianswer) {
            continue; // TODO
          } else {
            lAnswer = this.convertAnswerToSchrodinger(
              question,
              lAnswerRaw = (accessAnswerById(lAnswers, cid, qid) as any),
            );
            rAnswer = this.convertAnswerToSchrodinger(
              question,
              rAnswerRaw = (accessAnswerById(rAnswers, cid, qid) as any),
            );
          }
        } else {
          if (question.bianswer) {
            const id = this.props.reversed ? 1 : 0;
            lAnswer = this.convertAnswerToSchrodinger(
              question,
              lAnswerRaw = (accessAnswerById(rAnswers, cid, qid) as any)[id],
            );
            if (lAnswer === null) lAnswer = undefined;
            rAnswer = this.convertAnswerToSchrodinger(
              question,
              rAnswerRaw = (accessAnswerById(rAnswers, cid, qid) as any)[1 - id],
            );
            if (rAnswer === null) rAnswer = undefined;
          } else {
            continue; // TODO
          }
        }

        const shouldHideIfNotShowAll = lAnswer === undefined && rAnswer === undefined;

        if (!showAll && shouldHideIfNotShowAll) {
          continue;
        }

        const sTd = this.convertSchrodingerToElement(lAnswer, lAnswerRaw);
        const mTd = this.convertSchrodingerToElement(rAnswer, rAnswerRaw);

        let color = shouldHideIfNotShowAll ? '#eee' : 'white';

        results.push(
          <tr key={ cid + ',' + qid } style={{
            backgroundColor: color,
          }}>
            <td>{ t(question.title) }</td>
            { sTd }
            { mTd }
          </tr>,
        );
      }
    }
    return results;
  }
  public render() {
    const t = this.props.t;
    const headContent = this.props.basic ? (
        <tr>
          <th>{ t('lab.sm.compare.table.basic') }</th>
          <th>{ t('lab.sm.compare.table.myInfo') }</th>
          <th>{ t('lab.sm.compare.table.partnerInfo' }</th>
        </tr>
      ) : (
        <tr>
          <th>{ t('lab.sm.compare.table.item') }</th>
          <th>{ t('lab.sm.compare.table.meAsS') }</th>
          <th>{ t('lab.sm.compare.table.meAsM') }</th>
        </tr>
      );
    return (
      <React.Fragment>
        {!this.props.basic && <LinkButton
          children={
            this.state.showAll
              ? t('lab.sm.compare.table.switchToShowAvailable')
              : t('lab.sm.compare.table.switchToShowAll')
          }
          onClick={ this.onClickSwitchShowMode }
        />}
        <table>
          <thead>{ headContent }</thead>
          <tbody>
            { this.renderRows() }
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export const ComparisonTable = withTranslation()(ComparisonTableUW);
