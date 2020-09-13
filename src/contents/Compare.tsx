import {
  createClearCompareAction,
  createSetCompareFormAction,
  createStartCompareAction,
} from '../actions/compare';
import { Card } from '../components/Card';
import { ComparisonTable } from '../components/ComparisonTable';
import { InputField } from '../components/InputField';
import { LinkButton } from '../components/LinkButton';
import { SimpleFormat } from '../components/SimpleFormat';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Line } from 'rc-progress';
import { decode } from '../persistence';
import { IAnswersState } from '../reducers/answers';
import { IRootState } from '../RootState';
import { smPrepare, smDiscuss } from '../sm';
import download from '../download';

let Module;
  ({ Module } = window);
} else {
}

interface ICompareFormProps {
  readonly formSValue: string;
  readonly formMValue: string;
  readonly currentAnswers: IAnswersState;
  readonly startCompare: typeof createStartCompareAction;
}
interface ICompareFormState {
  readonly worker: unknown;
  readonly answers: Array<number> | null;
  readonly microDone: number;
  readonly step: number;
  readonly input: string;
  readonly output: string;
}
class CompareFormUW extends React.PureComponent<
ICompareFormProps,
ICompareFormState
> {
  public state = {
    worker: null,
    answers: null,
    microDone: 0,
    step: 0,
    input: '',
    output: '',
  };
  private onTick = (d: any) => {
    let { worker, answers, insts, microDone, step, input, output } = this.state;
    if (d !== undefined) {
      microDone++;
      switch (step) {
        case 105:
          output += d;
          if (microDone === answers.length) {
            this.setState({
              microDone,
              step: 11,
              output,
            });
            return;
          }
          break;
        case 205:
          output += d;
          if (microDone === answers.length) {
            this.setState({
              microDone,
              step: 21,
              output,
            });
            return;
          }
          break;
        case 215:
          input = d[0];
          output += d[1];
          if (microDone === answers.length) {
            this.setState({
              microDone,
              step: 22,
              input,
              output,
            });
            return;
          }
          break;
        case 115:
          input = d[0];
          output += d[1];
          if (microDone === answers.length) {
            this.setState({
              microDone,
              step: 12,
              input,
              output,
            });
            return;
          }
          break;
        case 225:
          input = d[0];
          output.push(d[1]);
          if (microDone === answers.length) {
            this.setState({
              microDone,
              step: 23,
              input,
              output: smDiscuss(output),
            });
            return;
          }
          break;
      }
    }
    switch (step) {
      case 105: {
        const v = answers[microDone];
        worker.postMessage({ id: microDone, cmd: 'alice-garble', v });
        break;
      }
      case 205: {
        const v = answers[microDone];
        worker.postMessage({ id: microDone, cmd: 'bob-prepare', v });
        break;
      }
      case 215: {
        worker.postMessage({ id: microDone, cmd: 'bob-inquiry', str: input });
        break;
      }
      case 115: {
        worker.postMessage({ id: microDone, cmd: 'alice-receive', str: input });
        break;
      }
      case 225: {
        worker.postMessage({ id: microDone, cmd: 'bob-evaluate', str: input });
        break;
      }
    }
    this.setState({
      microDone,
      output,
    });
  }
  private onClickAliceStart = () => {
    const worker = new Worker('../worker.js');
    worker.onmessage = ({ data }) => { this.onTick(data); };
    const answers = smPrepare(this.props.currentAnswers, false);
    this.setState({
      worker,
      answers,
      microDone: 0,
      step: 105,
      output: '',
    }, () => { this.onTick(); });
  }
  private onClickBobStart = () => {
    const worker = new Worker('../worker.js');
    worker.onmessage = ({ data }) => { this.onTick(data); };
    const answers = smPrepare(this.props.currentAnswers, true);
    this.setState({
      worker,
      answers,
      microDone: 0,
      step: 205,
      output: '',
    }, () => { this.onTick(); });
  }
  private handleDownload = () => {
    const { step, output } = this.state;
    switch (step) {
      case 11:
        download('1-alice-to-bob', output);
      break;
      case 22:
        download('2-bob-to-alice', output);
      break;
      case 12:
        download('3-alice-to-bob', output);
      break;
      case 23:
        download('4-bob-to-alice', JSON.stringify(output));
      break;
    }
  }
  private onClickNext = () => {
    const { step } = this.state;
    switch (step) {
      case 21:
        this.setState({ step: step + 1, output: '' });
      break;
      case 23: {
        const { output, alice0 } = this.state;
        this.props.startCompare(output, undefined, true);
        break;
      }
    }
    private handleUpload = ({ target }) => {
      const { files: [f] } = target;
      if (!f) {
        return;
      }
      const fr = new global.FileReader();
      fr.onload = ({ target: { result } }) => {
        const { step, output } = this.state;
        switch (this.state.step) {
          case 21: {
            this.setState({
              microDone: 0,
              step: 215,
              input: result,
              output: '',
            }, () => { this.onTick(); });
            break;
          }
          case 11: {
            this.setState({
              microDone: 0,
              step: 115,
              input: result,
              output: '',
            }, () => { this.onTick(); });
            break;
          }
          case 22: {
            this.setState({
              microDone: 0,
              step: 225,
              input: result,
              output: [],
            }, () => { this.onTick(); });
            break;
          }
          case 12: {
            target.value = null;
            const { output } = JSON.parse(result);
            this.props.startCompare(output, undefined, false);
            break;
          }
        }
      };
      fr.readAsText(f);
    };
    public render() {
      const { answers, microDone, step } = this.state;
      const t = this.props.t;
      switch (step) {
        case 0:
          return (
            <div>
              <SimpleFormat className="warning">
              {t('lab.sm.compare.alice.slow')}
            </SimpleFormat>
            <LinkButton
            children={t('lab.sm.compare.alice.start')}
            onClick={ this.onClickAliceStart }
            />
            <LinkButton
            children={t('lab.sm.compare.bob.start')}
            onClick={ this.onClickBobStart }
            />
          </div>
        );
        case 105:
        case 115:
          return (
            <div>
              <SimpleFormat className="warning">
              {t('lab.sm.compare.alice.slow')}
            </SimpleFormat>
            <Line
            percent={1 + microDone / answers.length * 99}
            />
          </div>
        );
        case 205:
        case 215:
        case 225:
          return (
            <div>
              <Line
              percent={1 + microDone / answers.length * 99}
              />
            </div>
        );
        case 11:
          return (
            <div>
              <SimpleFormat className="warning">
              {t('lab.sm.compare.alice.slow')}
            </SimpleFormat>
            <SimpleFormat>
            {t('lab.sm.compare.alice.send1get2')}
          </SimpleFormat>
          <LinkButton
          children={t('lab.sm.compare.download')}
          onClick={ this.handleDownload }
          />
          <input type="file" onChange={this.handleUpload} />
        </div>
        );
        case 21:
          return (
            <div>
              <SimpleFormat>
              {t('lab.sm.compare.bob.get1')}
            </SimpleFormat>
            <input type="file" onChange={this.handleUpload} />
          </div>
        );
        case 12:
          return (
            <div>
              <SimpleFormat className="finished">
              {t('lab.sm.compare.alice.slow')}
            </SimpleFormat>
            <SimpleFormat className="finished">
            {t('lab.sm.compare.alice.send1get2')}
          </SimpleFormat>
          <SimpleFormat>
          {t('lab.sm.compare.alice.send3get4')}
        </SimpleFormat>
        <LinkButton
        children={t('lab.sm.compare.download')}
        onClick={ this.handleDownload }
        />
        <input type="file" onChange={this.handleUpload} />
      </div>
        );
        case 22:
          return (
            <div>
              <SimpleFormat className="finished">
              {t('lab.sm.compare.bob.get1')}
            </SimpleFormat>
            <SimpleFormat>
            {t('lab.sm.compare.bob.send2get3')}
          </SimpleFormat>
          <LinkButton
          children={t('lab.sm.compare.download')}
          onClick={ this.handleDownload }
          />
          <input type="file" onChange={this.handleUpload} />
        </div>
        );
        case 23:
          return (
            <div>
              <SimpleFormat className="finished">
              {t('lab.sm.compare.bob.get1')}
            </SimpleFormat>
            <SimpleFormat className="finished">
            {t('lab.sm.compare.bob.send2get3')}
          </SimpleFormat>
          <SimpleFormat>
          {t('lab.sm.compare.bob.send4')}
        </SimpleFormat>
        <LinkButton
        children={t('lab.sm.compare.download')}
        onClick={ this.handleDownload }
        />
        <LinkButton
        children={t('lab.sm.compare.show')}
        onClick={ this.onClickNext }
        />
      </div>
        );
      }
    }
  }
  const CompareForm = withTranslation()(connect((state: IRootState) => ({
    currentAnswers: state.answers,
  }), {
    startCompare: createStartCompareAction,
  })(CompareFormUW));

  interface ICompareProps {
    readonly comparing: null | {
      o: IAnswersState,
      b: IAnswersState,
    };
    readonly currentAnswers: IAnswersState;
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
            <CompareForm/>
          </Card>
          { this.props.comparing !== null && <Card>
            <h1>{ t('lab.sm.compare.table.title') }</h1>
            <LinkButton
            children={t('lab.sm.compare.table.clear')}
            onClick={ this.props.clearCompare }
            />
            <ComparisonTable
            basic
            my={ this.props.currentAnswers[0] }
            partner={ this.props.comparing.b }
            />
            <ComparisonTable
            my={ this.props.currentAnswers }
            partner={ this.props.comparing.o }
            reversed={ this.props.comparing.reversed }
            />
        </Card> }
      </div>
      );
    }
  }
  export const Compare = withTranslation()(connect((state: IRootState) => ({
    currentAnswers: state.answers,
    comparing: state.compare.comparing,
  }), {
    clearCompare: createClearCompareAction,
  })(CompareUW));
