export enum ContentType {
  PROFILE,
  COMPARE,
  LANGUAGE,
  IMPORT,
  EXPORT,
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
    case ContentType.IMPORT:
      return t('lab.sm.contentTitle.import');
    case ContentType.EXPORT:
      return t('lab.sm.contentTitle.export');
    case ContentType.ABOUT:
      return t('lab.sm.contentTitle.about');
  }
}
