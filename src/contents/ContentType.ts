export enum ContentType {
  PROFILE,
  COMPARE,
  LANGUAGE,
  RESET,
  BACKUP,
  ABOUT,
}

export function getContentTitle(t: any, type: ContentType): string {
  switch (type) {
    case ContentType.PROFILE:
      return t('lab.sm.contentTitle.profile');
    case ContentType.COMPARE:
      return t('lab.sm.contentTitle.compare');
    case ContentType.LANGUAGE:
      return 'Language Selection';
    case ContentType.RESET:
      return t('lab.sm.contentTitle.reset');
    case ContentType.BACKUP:
      return t('lab.sm.contentTitle.backup');
    case ContentType.ABOUT:
      return t('lab.sm.contentTitle.about');
  }
}
