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

interface IImporterState {
  readonly value: string;
  readonly submitText: string;
  readonly hint: string | null;
  readonly hintColor: string;
}
interface IImporterProps {
  readonly replaceAnswers: typeof createReplaceAnswersAction;
}
class ImporterUW extends React.PureComponent<IImporterProps, IImporterState> {
  public constructor(props: IImporterProps) {
    super(props);
    this.state = {
      value: '',
      submitText: 'lab.sm.import.import',
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
      submitText: 'lab.sm.import.import',
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
        submitText: 'lab.sm.import.confirm',
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
          hint: 'lab.sm.import.failed',
          hintColor: 'red',
        });
      } else {
        this.setState({
          hint: 'lab.sm.import.successful',
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
          label={t('lab.sm.import.label')}
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

const Importer = withTranslation()(connect(null, {
  replaceAnswers: createReplaceAnswersAction,
})(ImporterUW));

class ImportUW extends React.PureComponent {
  public render() {
    const t = this.props.t;
    return (
      <div className='content import'>
        <Card>
          <h1>{ t('lab.sm.import.title') }</h1>
          <SimpleFormat>{ t('lab.sm.import.desc') }</SimpleFormat>
          <Importer/>
        </Card>
      </div>
    );
  }
}

export const Import = withTranslation()(ImportUW);
