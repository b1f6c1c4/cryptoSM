import { createReplaceAnswersAction } from '../actions/answers';
import { Card } from '../components/Card';
import { InputField } from '../components/InputField';
import { LinkButton } from '../components/LinkButton';
import { SimpleFormat } from '../components/SimpleFormat';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { decode } from '../persistence';
import { IAnswersState } from '../reducers/answers';

interface IResetterState {
  readonly value: string;
  readonly submitText: string;
  readonly hint: string | null;
  readonly hintColor: string;
}
interface IResetterProps {
  readonly replaceAnswers: typeof createReplaceAnswersAction;
}
class ResetterUW extends React.PureComponent<IResetterProps, IResetterState> {
  public constructor(props: IResetterProps) {
    super(props);
    this.state = {
      value: '',
      submitText: 'lab.sm.reset.reset',
      hint: null,
      hintColor: 'black',
    };
  }
  private onChange = (value: string) => {
    this.setState({ value });
  }
  private changeBackTimer: number | null = null;
  private changeBack = () => {
    this.setState({
      submitText: 'lab.sm.reset.reset',
    });
    if (this.changeBackTimer !== null) {
      clearTimeout(this.changeBackTimer);
      this.changeBackTimer = null;
    }
  }
  private onClickSubmit: React.EventHandler<React.MouseEvent<any>> = event => {
    event.preventDefault();
    if (this.changeBackTimer === null) {
      this.setState({
        submitText: 'lab.sm.reset.confirm',
        hint: null,
      });
      this.changeBackTimer = window.setTimeout(this.changeBack, 2000);
    } else {
      this.changeBack();
      let result: IAnswersState = {};
      this.setState({
        hint: 'lab.sm.reset.successful',
        hintColor: 'green',
      });
      this.props.replaceAnswers(result);
    }
  }
  public componentWillUnmount() {
    if (this.changeBackTimer !== null) {
      clearTimeout(this.changeBackTimer);
    }
  }
  public render() {
    const t = this.props.t;
    return (
      <div>
        <LinkButton onClick={ this.onClickSubmit }>
          { t(this.state.submitText) }
        </LinkButton>
        { this.state.hint && <p style={{
          color: this.state.hintColor,
        }}>{ t(this.state.hint) }</p> }
      </div>
    );
  }
}

const Resetter = withTranslation()(connect(null, {
  replaceAnswers: createReplaceAnswersAction,
})(ResetterUW));

class ResetUW extends React.PureComponent {
  public render() {
    const t = this.props.t;
    return (
      <div className='content reset'>
        <Card>
          <h1>{ t('lab.sm.reset.title') }</h1>
          <SimpleFormat>{ t('lab.sm.reset.desc') }</SimpleFormat>
          <Resetter/>
        </Card>
      </div>
    );
  }
}

export const Reset = withTranslation()(ResetUW);
