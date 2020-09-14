import {
  createInitCompareAction,
  createStepCompareAction,
  createFinishCompareAction,
  createClearCompareAction,
} from '../actions/compare';
import { Card } from '../components/Card';
import { ComparisonTable } from '../components/ComparisonTable';
import { LinkButton } from '../components/LinkButton';
import { SimpleFormat } from '../components/SimpleFormat';
import * as React from 'react';
import { connect } from 'react-redux';
import _get from 'lodash/get';
import { withTranslation } from 'react-i18next';
import memoizeOne from 'memoize-one';
import { Line } from 'rc-progress';
import { decode } from '../persistence';
import { IAnswersState } from '../reducers/answers';
import { IRootState } from '../RootState';
import { smPrepare, smDiscuss } from '../sm';
import download from '../download';

interface ICompareFormProps {
  readonly currentAnswers: IAnswersState;
  readonly resultAnswers: IAnswersState;
  readonly role: string | null;
  readonly step: string | null;
  readonly crypto: string | null;
  readonly output: string | null;
  readonly initCompare: typeof createInitCompareAction;
  readonly stepCompare: typeof createStepCompareAction;
  readonly finishCompare: typeof createFinishCompareAction;
}
interface ICompareFormState {
  readonly nextStep: string | null;
  readonly answers: Array<number> | null;
  readonly worker: unknown;
  readonly micros: number;
  readonly restInput: string;
  readonly partialOutput: string;
}
class CompareFormUW extends React.PureComponent<
  ICompareFormProps,
  ICompareFormState
> {
  public state = {
    nextStep: null,
    answers: null,
    worker: new Worker('../worker.js'),
    micros: 0,
    restInput: '',
    partialOutput: '',
  };
  public componentDidMount() {
    const { role, crypto, currentAnswers } = this.props;
    const { worker } = this.state;
    worker.onmessage = ({ data }) => { this.doneStuff(data); };
    if (crypto) {
      if (role === 'alice') {
        worker.postMessage({ cmd: 'alice-deserialize', ss: crypto });
      } else {
        worker.postMessage({ cmd: 'bob-deserialize', ss: crypto });
      }
    }
    if (role !== null) {
      this.setState({
        answers: smPrepare(currentAnswers, role === 'bob'),
      });
    }
  }
  public componentWillUnmount() {
    const { worker } = this.state;
    if (worker) {
      worker.terminate();
    }
  }
  private doneStuff = (d: any) => {
    const { answers, micros, restInput, partialOutput } = this.state;
    switch (this.state.nextStep) {
      case 'alice-garble':
        if (micros < answers.length) {
          this.setState({
            micros: micros + 1,
            partialOutput: partialOutput + d,
          }, this.nextStuff);
        } else {
          this.props.initCompare(true, d, partialOutput);
        }
        break;
      case 'bob-init':
        if (micros < answers.length) {
          this.setState({
            micros: micros + 1,
          }, this.nextStuff);
        } else {
          this.props.initCompare(false, d);
        }
        break;
      case 'bob-inquiry':
      case 'alice-receive':
        if (micros < answers.length) {
          this.setState({
            micros: micros + 1,
            restInput: d[0],
            partialOutput: partialOutput + d[1],
          }, this.nextStuff);
        } else {
          this.props.stepCompare(d, partialOutput);
        }
        break;
      case 'bob-evaluate':
        partialOutput.push(d[1]);
        if (micros < answers.length) {
          this.setState({
            micros: micros + 1,
            restInput: d[0],
            partialOutput,
          }, this.nextStuff);
        } else {
          this.props.finishCompare(smDiscuss(partialOutput));
        }
        break;
    }
  }
  private nextStuff = () => {
    let { answers, nextStep, worker, micros, restInput } = this.state;
    if (micros < answers.length) {
      switch (nextStep) {
        case 'alice-garble':
        case 'bob-init':
          worker.postMessage({
            id: micros,
            cmd: nextStep,
            v: answers[micros],
          });
          break;
        default:
          worker.postMessage({
            id: micros,
            cmd: nextStep,
            str: restInput,
          });
          break;
      }
      this.setState({ micros });
    } else {
      worker.postMessage({ cmd: 'serialize' });
    }
  }
  private onClickStart = (isAlice: boolean) => {
    this.setState({
      nextStep: isAlice ? 'alice-garble' : 'bob-init',
      answers: smPrepare(this.props.currentAnswers, !isAlice),
      micros: 0,
      partialOutput: '',
    }, () => { this.nextStuff(); });
  }
  private onClickAliceStart = () => { this.onClickStart(true); }
  private onClickBobStart = () => { this.onClickStart(false); }
  private handleDownload = () => {
    const { step, output, resultAnswers } = this.props;
    switch (step) {
      case 'garble': download('1-alice-to-bob', output); break;
      case 'inquiry': download('2-bob-to-alice', output); break;
      case 'receive': download('3-alice-to-bob', output); break;
      case 'done': download('4-bob-to-alice', JSON.stringify(resultAnswers)); break;
    }
  }
  private handleUpload = ({ target }) => {
    const { files: [f] } = target;
    if (!f) {
      return;
    }
    const fr = new global.FileReader();
    fr.onload = ({ target: { result } }) => {
      target.value = '';
      const { step, output } = this.state;
      switch (this.props.step) {
        case 'init':
          this.setState({
            nextStep: 'bob-inquiry',
            micros: 0,
            restInput: result,
            partialOutput: '',
          }, () => { this.nextStuff(); });
          break;
        case 'garble':
          this.setState({
            nextStep: 'alice-receive',
            micros: 0,
            restInput: result,
            partialOutput: '',
          }, () => { this.nextStuff(); });
          break;
        case 'inquiry':
          this.setState({
            nextStep: 'bob-evaluate',
            micros: 0,
            restInput: result,
            partialOutput: [],
          }, () => { this.nextStuff(); });
          break;
        case 'receive':
          this.props.finishCompare(JSON.parse(result));
      }
    };
    fr.readAsText(f);
  }
  public render() {
    const { answers, nextStep, micros, partialOutput } = this.state;
    const { t, role, step, output } = this.props;
    const d = [];
    if (role === null) {
      d.push((
        <SimpleFormat key="warn" className="warning">
          {t('lab.sm.compare.alice.slow')}
        </SimpleFormat>
      ));
      if (nextStep === null) {
        d.push((
          <LinkButton
            key="btnA"
            children={t('lab.sm.compare.alice.start')}
            onClick={ this.onClickAliceStart }
          />
        ));
        d.push((
          <LinkButton
            key="btnB"
            children={t('lab.sm.compare.bob.start')}
            onClick={ this.onClickBobStart }
          />
        ));
      }
    } else {
      const dd = [];
      if (role === 'alice') {
        dd.push((
          <li key="a12" className={({
            garble: 'current',
            receive: 'finished',
            done: 'finished',
          })[step]}>
            <SimpleFormat>
              {t('lab.sm.compare.alice.send1get2')}
            </SimpleFormat>
          </li>
        ));
        dd.push((
          <li key="a34" className={({
            receive: 'current',
            done: 'finished',
          })[step]}>
            <SimpleFormat>
              {t('lab.sm.compare.alice.send3get4')}
            </SimpleFormat>
          </li>
        ));
      } else {
        dd.push((
          <li key="b1" className={({
            init: 'current',
            inquiry: 'finished',
            done: 'finished',
          })[step]}>
            <SimpleFormat>
              {t('lab.sm.compare.bob.get1')}
            </SimpleFormat>
          </li>
        ));
        dd.push((
          <li key="b23" className={({
            inquiry: 'current',
            done: 'finished',
          })[step]}>
            <SimpleFormat>
              {t('lab.sm.compare.bob.send2get3')}
            </SimpleFormat>
          </li>
        ));
        dd.push((
          <li key="b4" className={({
            done: 'current',
          })[step]}>
            <SimpleFormat>
              {t('lab.sm.compare.bob.send4')}
            </SimpleFormat>
          </li>
        ));
      }
      d.push((
        <ol key="steps" className="steps">
          {dd}
        </ol>
      ));
    }
    if (nextStep) {
      d.push((
        <Line key="prog" percent={1 + micros / answers.length * 99} />
      ));
    } else {
      if (output || step === 'done' && role === 'bob') {
        d.push((
          <LinkButton
            key="download"
            children={t('lab.sm.compare.download')}
            onClick={ this.handleDownload }
          />
        ));
      }
      if (step && step !== 'done') {
        d.push((
          <input key="upload" type="file" onChange={this.handleUpload} />
        ));
      }
    }
    return (
      <div>
        {d}
      </div>
    );
  }
}

const CompareForm = withTranslation()(connect((state: IRootState) => ({
  currentAnswers: state.answers,
  resultAnswers: _get(state, ['compare', 'result']),
  role: _get(state, ['compare', 'role']),
  step: _get(state, ['compare', 'step']),
  crypto: _get(state, ['compare', 'crypto']),
  output: _get(state, ['compare', 'output']),
}), {
  initCompare: createInitCompareAction,
  stepCompare: createStepCompareAction,
  finishCompare: createFinishCompareAction,
})(CompareFormUW));

interface ICompareProps {
  readonly currentAnswers: IAnswersState;
  readonly resultAnswers: IAnswersState;
  readonly reversed: boolean;
  readonly formKey: any;
  readonly clearCompare: typeof createClearCompareAction;
}
class CompareUW extends React.PureComponent<ICompareProps> {
  public render() {
    const t = this.props.t;
    return (
      <div className='content compare'>
        <Card>
          <h1>{ t('lab.sm.compare.title') }</h1>
          <SimpleFormat>{ t('lab.sm.compare.desc') }</SimpleFormat>
          <LinkButton
            children={t('lab.sm.compare.table.clear')}
            onClick={ this.props.clearCompare }
          />
          <CompareForm key={this.props.formKey} />
        </Card>
        { this.props.resultAnswers && (
          <Card>
            <h1>{ t('lab.sm.compare.table.title') }</h1>
            <ComparisonTable
              my={ this.props.currentAnswers }
              partner={ this.props.resultAnswers }
              reversed={ this.props.reversed }
            />
          </Card>
        )}
      </div>
    );
  }
}
export const Compare = withTranslation()(connect((state: IRootState) => ({
  currentAnswers: state.answers,
  resultAnswers: _get(state, ['compare', 'result']),
  reversed: _get(state, ['compare', 'role']) === 'bob',
  formKey: [_get(state, ['compare', 'step']), _get(state, ['compare', 'crypto'])],
}), {
  clearCompare: createClearCompareAction,
})(CompareUW));
