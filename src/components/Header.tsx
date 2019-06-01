import { createLowerCoverAction } from '../actions/currentView';
import { getContentTitle } from '../contents/ContentType';
import * as React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { IRootState } from '../RootState';

interface IHeaderProps {
  readonly subtitle: string;
  readonly lowerCover: typeof createLowerCoverAction;
}
class HeaderUW extends React.PureComponent<IHeaderProps> {
  public render() {
    const t = this.props.t;
    return (
      <div className='header-container'>
        <div className='header'>
          <span className='clickable' onClick={ this.props.lowerCover }>
            SM Contract
          </span>
          <span>
            { ' · ' + getContentTitle(t, this.props.subtitle) }
          </span>
        </div>
      </div>
    );
  }
}
export const Header = withTranslation()(connect((
  state: IRootState,
) => ({
  subtitle: state.currentView.content,
}), {
  lowerCover: createLowerCoverAction,
})(HeaderUW));
