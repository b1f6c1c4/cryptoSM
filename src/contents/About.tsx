import { Card } from '../components/Card';
import { SimpleFormat } from '../components/SimpleFormat';
import * as React from 'react';
import { withTranslation } from 'react-i18next';

class AboutUW extends React.PureComponent {
  public render() {
    const t = this.props.t;
    return (
      <div className='content about'>
        <Card>
          <h1>{ t('lab.sm.about.openSource.title') }</h1>
          <p>
            { t('lab.sm.about.openSource.link') + ': ' }
            <a
              target='_blank'
              href='https://github.com/SCLeoX/sm-contract'
              children='https://github.com/SCLeoX/sm-contract'
              rel='noopener'
            />
          </p>
          <SimpleFormat>{ t('lab.sm.about.openSource.desc') }</SimpleFormat>
        </Card>
        <Card>
          <h1>{ t('lab.sm.about.faq.title') }</h1>
          <SimpleFormat>{ t('lab.sm.about.faq.content') }</SimpleFormat>
        </Card>
      </div>
    );
  }
}

export const About = withTranslation()(AboutUW);
