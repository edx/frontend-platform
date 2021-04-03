import 'babel-polyfill'; // eslint-disable-line import/no-extraneous-dependencies

import React from 'react';
import ReactDOM from 'react-dom';
import {
  AppProvider,
  AuthenticatedPageRoute,
  ErrorPage,
  PageRoute,
} from '@edx/frontend-platform/react';
import { APP_INIT_ERROR, APP_READY, initialize } from '@edx/frontend-platform';
import { subscribe } from '@edx/frontend-platform/pubSub';
import { getAnalyticsService } from '@edx/frontend-platform/analytics';
import { ParagonProvider } from '@edx/paragon';

import ExamplePage from './ExamplePage';
import ExamplePageWithAnalytics from './ExamplePageWithAnalytics';
import AuthenticatedPage from './AuthenticatedPage';

import './index.scss';

subscribe(APP_READY, () => {
  const analyticsService = getAnalyticsService();

  ReactDOM.render(
    <AppProvider>
      <ParagonProvider
        analytics={{
          sendTrackEvent: (eventName, eventPoperties) => analyticsService.sendTrackEvent(eventName, eventPoperties),
        }}
      >
        <PageRoute exact path="/" component={ExamplePage} />
        <PageRoute exact path="/analytics" component={ExamplePageWithAnalytics} />
        <PageRoute
          exact
          path="/error_example"
          component={() => <ErrorPage message="Test error message" />}
        />
        <AuthenticatedPageRoute exact path="/authenticated" component={AuthenticatedPage} />
      </ParagonProvider>
    </AppProvider>,
    document.getElementById('root'),
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
