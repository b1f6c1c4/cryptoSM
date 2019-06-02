import { createSetContentAction, IActionSetContent } from '../actions/currentView';
import { getContent } from '../contents/Content';
import { ContentType } from '../contents/ContentType';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation, useTranslation } from 'react-i18next';
import EditIcon from '@material-ui/icons/Edit';
import CompareIcon from '@material-ui/icons/Compare';
import LanguageIcon from '@material-ui/icons/Language';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import InfoIcon from '@material-ui/icons/Info';
import { IRootState } from '../RootState';
import { Button } from './Button';
import { Header } from './Header';

const Title = () => (
  <div className='title-container'>
    <h2>crypto</h2>
    <h1>SM</h1>
  </div>
);
const PrivacyNotice = () => {
  const { t } = useTranslation();
  return (
    <p
      className='privacy-notice'
      children={t('lab.sm.landing.privacyNotice')}
    />
  );
};
interface IButtonPanelProps {
  readonly setContent: (content: ContentType) => IActionSetContent;
}
class ButtonPanelUW extends React.PureComponent<IButtonPanelProps> {
  public onClickStart = () => {
    this.props.setContent(ContentType.PROFILE);
  }
  public onClickCompare = () => {
    this.props.setContent(ContentType.COMPARE);
  }
  public onClickLanguage = () => {
    this.props.setContent(ContentType.LANGUAGE);
  }
  public onClickImport = () => {
    this.props.setContent(ContentType.IMPORT);
  }
  public onClickExport = () => {
    this.props.setContent(ContentType.EXPORT);
  }
  public onClickAbout = () => {
    this.props.setContent(ContentType.ABOUT);
  }
  public render() {
    const t = this.props.t;
    return (
      <div className='button-panel'>
        <Button
          class='start'
          text={t('lab.sm.landing.start')}
          onClick={ this.onClickStart }
        >
          <EditIcon />
        </Button>
        <Button
          class='compare'
          text={t('lab.sm.landing.compare')}
          onClick={ this.onClickCompare }
        >
          <CompareIcon />
        </Button>
        <Button
          class='language'
          text='Language'
          onClick={ this.onClickLanguage }
        >
          <LanguageIcon />
        </Button>
        <Button
          class='import'
          text={t('lab.sm.landing.import')}
          onClick={ this.onClickImport }
        >
          <CloudUploadIcon />
        </Button>
        <Button
          class='export'
          text={t('lab.sm.landing.export')}
          onClick={ this.onClickExport }
        >
          <CloudDownloadIcon />
        </Button>
        <Button
          class='about'
          text={t('lab.sm.landing.about')}
          onClick={ this.onClickAbout }
        >
          <InfoIcon />
        </Button>
      </div>
    );
  }
}
const ButtonPanel = withTranslation()(connect(null, {
  setContent: createSetContentAction,
})(ButtonPanelUW));
const Landing = (t) => (
  <div className='landing'>
    <Header/>
    <Title/>
    <PrivacyNotice/>
    <ButtonPanel/>
  </div>
);

interface ICoverProps {
  readonly lifted: boolean;
  readonly content: ContentType;
}

class CoverUW extends React.Component<ICoverProps> {
  public render() {
    const t = this.props.t;
    return (
      <div>
        <div className='content-padding'/>
        { getContent(this.props.content) }
        <div className={ 'cover' + (this.props.lifted ? ' lifted' : '') }>
          <Landing t={t} />
        </div>
      </div>
    );
  }
}

export const Cover = withTranslation()(connect((state: IRootState) => ({
  lifted: !state.currentView.cover,
  content: state.currentView.content,
}))(CoverUW));
