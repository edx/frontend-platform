export {
  configure,
  identifyAnonymousUser,
  identifyAuthenticatedUser,
  sendPageEvent,
  sendTrackEvent,
  sendTrackLinkEvent,
  sendTrackingLogEvent,
  getAnalyticsService,
  resetAnalyticsService,
} from './interface';
export { default as SegmentAnalyticsService } from './SegmentAnalyticsService';
export { default as MockAnalyticsService } from './MockAnalyticsService';
