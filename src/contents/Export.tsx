import { Card } from '../components/Card';
import { SimpleFormat } from '../components/SimpleFormat';
import * as React from 'react';
import { withTranslation } from 'react-i18next';

class ExportUW extends React.PureComponent {
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
      <div className='content export'>
        <Card>
          <h1>{ t('lab.sm.export.title') }</h1>
          <SimpleFormat>{ t('lab.sm.export.desc') }</SimpleFormat>
          <code
            ref={ this.updateRef }
            onClick={ this.onClick }
          >
            { window.localStorage.getItem('encodedAnswers') }
          </code>
        </Card>
      </div>
    );
  }
}

export const Export = withTranslation()(ExportUW);
