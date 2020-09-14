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

interface IRestorerState {
  readonly value: string;
  readonly submitText: string;
  readonly hint: string | null;
  readonly hintColor: string;
}
interface IRestorerProps {
  readonly replaceAnswers: typeof createReplaceAnswersAction;
}
class RestorerUW extends React.PureComponent<IRestorerProps, IRestorerState> {
  public constructor(props: IRestorerProps) {
    super(props);
    this.state = {
      value: '',
      submitText: 'lab.sm.restore.restore',
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
      submitText: 'lab.sm.restore.restore',
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
        submitText: 'lab.sm.restore.confirm',
        hint: null,
      });
      this.changeBackTimer = window.setTimeout(this.changeBack, 2000);
    } else {
      this.changeBack();
      let result: IAnswersState | null;
      try {
        result = decode(this.state.value.trim());
      } catch (e) {
        result = null;
      }
      if (result === null) {
        this.setState({
          hint: 'lab.sm.restore.failed',
          hintColor: 'red',
        });
      } else {
        this.setState({
          hint: 'lab.sm.restore.successful',
          hintColor: 'green',
        });
        this.props.replaceAnswers(result);
      }
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
        <InputField
          label={t('lab.sm.restore.label')}
          onChange={ this.onChange }
          value={ this.state.value }
        />
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

const Restorer = withTranslation()(connect(null, {
  replaceAnswers: createReplaceAnswersAction,
})(RestorerUW));

class BackupUW extends React.PureComponent {
  private codeRef: HTMLElement;
  private updateRef = (ref: HTMLElement | null) => {
    if (ref !== null) {
      this.codeRef = ref;
    }
  }
  private clicked: boolean = false;
  private onClick = () => {
    if (this.clicked) {
      return;
    }
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(this.codeRef);
    selection.removeAllRanges();
    selection.addRange(range);
    this.clicked = true;
  }
  public render() {
    const t = this.props.t;
    return (
      <div className='content backup'>
        <Card>
          <h1>{ t('lab.sm.backup.title') }</h1>
          <SimpleFormat>{ t('lab.sm.backup.desc') }</SimpleFormat>
          <code
            ref={ this.updateRef }
            onClick={ this.onClick }
          >
            { window.localStorage.getItem('encodedAnswers') }
          </code>
        </Card>
        <Card>
          <h1>{ t('lab.sm.restore.title') }</h1>
          <SimpleFormat>{ t('lab.sm.restore.desc') }</SimpleFormat>
          <Restorer/>
        </Card>
      </div>
    );
  }
}

export const Backup = withTranslation()(BackupUW);
