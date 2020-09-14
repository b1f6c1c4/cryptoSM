import * as React from 'react';
import { About } from './About';
import { Compare } from './Compare';
import { ContentType } from './ContentType';
import { Backup } from './Backup';
import { Reset } from './Reset';
import { Language } from './Language';
import { Profile } from './Profile';

export function getContent(content: ContentType): React.ReactNode {
  switch (content) {
    case ContentType.PROFILE:
      return <Profile/>;
    case ContentType.COMPARE:
      return <Compare/>;
    case ContentType.LANGUAGE:
      return <Language/>;
    case ContentType.RESET:
      return <Reset/>;
    case ContentType.BACKUP:
      return <Backup/>;
    case ContentType.ABOUT:
      return <About/>;
  }
  return null;
}
