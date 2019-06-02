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
import { decode } from '../persistence';
import { IAnswersState } from '../reducers/answers';
import { IRootState } from '../RootState';
import { smPrepare, smDiscuss } from '../sm';
import download from '../download';

let Module;
if (process.env.NODE_ENV === 'production') {
  ({ Module } = window);
} else {
  class Alice4 {
    constructor(v) { this.v = v; }
    public garble = () => '--garble--';
    public receive = () => '--receive' + v;
    public remove = () => {};
  }
  class Bob4 {
    constructor(v) { this.v = v; }
    public inquiry = () => '--inquiry-';
    public evaluate = (r) => Math.min(this.v, parseInt(r.substr(9), 10));
    public remove = () => {};
  }
  Module = {
    garbleSize4: 5,
    inquirySize4: 5,
    receiveSize4: 5,
    Alice4,
    Bob4,
  };
}

interface ICompareFormProps {
  readonly formSValue: string;
  readonly formMValue: string;
  readonly currentAnswers: IAnswersState;
  readonly startCompare: typeof createStartCompareAction;
}
interface ICompareFormState {
  readonly step: number;
  readonly isAlice: boolean;
  readonly gc: number;
  readonly output: string;
  readonly alice0: any;
}
class CompareFormUW extends React.PureComponent<
  ICompareFormProps,
  ICompareFormState
> {
  public state = {
    step: 0,
    gc: 0,
    output: '',
    alice0: null,
  };
  private onClickAliceStart = () => {
    const res = smPrepare(this.props.currentAnswers, false);
    const os = [];
    let output = '';
    res.forEach((v) => {
      const o = new Module.Alice4(v);
      output += o.garble();
      os.push(o);
    });
    this.setState({
      step: 11,
      gc: os,
      output,
    });
  }
  private onClickBobStart = () => {
    const res = smPrepare(this.props.currentAnswers, true);
    const os = [];
    res.forEach((v) => {
      os.push(new Module.Bob4(v));
    });
    this.setState({
      step: 21,
      gc: os,
      output: '',
    });
  }
  private handleDownload = () => {
    const { currentAnswers: [basic] } = this.props;
    const { step, output } = this.state;
    switch (step) {
      case 11:
        download('1-alice-to-bob', output + JSON.stringify(basic));
        break;
      case 22:
        download('2-bob-to-alice', output);
        break;
      case 12:
        download('3-alice-to-bob', output);
        break;
      case 23:
        download('4-bob-to-alice', JSON.stringify({ output, basic }));
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
        this.props.startCompare(output, alice0, true);
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
      const { currentAnswers: [basic] } = this.props;
      const { step, output } = this.state;
      switch (this.state.step) {
        case 21: {
          let str = result;
          let output = '';
          this.state.gc.forEach((o) => {
            output += o.inquiry(str.substr(0, Module.garbleSize4 * 2));
            str = str.substr(Module.garbleSize4 * 2);
          });
          this.setState({
            step: 22,
            output,
            alice0: JSON.parse(str),
          });
          break;
        }
        case 11: {
          target.value = null;
          let str = result;
          let output = '';
          this.state.gc.forEach((o) => {
            output += o.receive(str.substr(0, Module.inquirySize4 * 2));
            str = str.substr(Module.inquirySize4 * 2);
            o.remove();
          });
          this.setState({ step: 12, output });
          break;
        }
        case 22: {
          let str = result;
          const output = [];
          this.state.gc.forEach((o) => {
            let r = o.evaluate(str.substr(0, Module.receiveSize4 * 2));
            if (r === -1)
              r = NaN;
            output.push(r);
            str = str.substr(Module.receiveSize4 * 2);
            o.remove();
          });
          this.setState({
            step: 23,
            output: smDiscuss(output),
          });
          break;
        }
        case 12: {
          target.value = null;
          const { output, basic } = JSON.parse(result);
          this.props.startCompare(output, basic, false);
          break;
        }
      }
    };
    fr.readAsText(f);
  };
  public render() {
    const t = this.props.t;
    switch (this.state.step) {
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
      case 11:
        return (
          <div>
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
