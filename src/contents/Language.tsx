import { createLowerCoverAction } from '../actions/currentView';
import { Card } from '../components/Card';
import { LinkButton } from '../components/LinkButton';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

interface ILanguageOptionProps {
  readonly display: string;
  readonly name: string;
}
class LanguageOptionUW extends React.PureComponent<ILanguageOptionProps> {
  public onClick: React.EventHandler<React.MouseEvent<any>> = event => {
    const i18n = this.props.i18n;
    i18n.changeLanguage(this.props.name, () => { this.props.lowerCover(); });
  }
  public render() {
    return (
      <LinkButton onClick={ this.onClick }>
        { this.props.display }
      </LinkButton>
    );
  }
}

const LanguageOption = withTranslation()(connect(null, {
  lowerCover: createLowerCoverAction,
})(LanguageOptionUW);

export class Language extends React.PureComponent {
  public render() {
    return (
      <div className='content language'>
        <Card>
          <h1>Language Selection</h1>
          <LanguageOption display='简体中文' name='zh_CN'/>
          <LanguageOption display='繁體中文（香港）—— by Sora' name='zh_HK'/>
          <LanguageOption display='English (United States)' name='en_US'/>
        </Card>
      </div>
    );
  }
}
