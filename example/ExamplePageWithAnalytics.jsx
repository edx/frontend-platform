/* eslint-disable no-console */

import React, { useState } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { getAnalyticsService } from '@edx/frontend-platform/analytics';
import { Button, Container, Hyperlink } from '@edx/paragon';

const ExamplePageWithAnalytics = () => {
  const analyticsService = getAnalyticsService();
  const [emailOptIn, setEmailOptIn] = useState(false);

  return (
    <Container>
      <h1>{getConfig().SITE_NAME} example page with analytics.</h1>
      <p>
        This page demonstrates tracking app-level events with Paragon components.
      </p>
      <p>
        Pass an <code>analyticEvents</code> prop to the Paragon component with a collection of event
        handlers you wish to track. Each event handler should be an object containing the following fields:
      </p>
      <ul>
        <li>
          <strong>name:</strong> The name of the event.
        </li>
        <li>
          <strong>properties:</strong> Additional metadata about the event.
        </li>
        <li>
          <strong>dispatchers:</strong> Extra dispatch functions to use beyond
          Paragon&apos;s default <code>sendTrackEvent</code>.
        </li>
      </ul>
      <p>
        Click one of the below buttons and/or hyperlinks to observe an API call that logs the event
        using the configured analytics service (e.g., Segment).
      </p>
      <div className="mb-3">
        <p>
          Update the <code>emailOptIn</code> state by clicking the below button. Doing so will simulate the
          analytics events for when props dynamically change on a component.
        </p>
        <div className="d-flex align-items-center">
          <Button
            variant="outline-primary"
            onClick={() => setEmailOptIn(prevState => !prevState)}
            className="mr-3"
          >
            Toggle email opt-in
          </Button>
          <span>Current state: {emailOptIn ? 'TRUE' : 'FALSE'}</span>
        </div>
      </div>
      <hr />
      <div>
        <Button
          as="a"
          href="https://edx.org"
          variant="tertiary"
          className="mr-2"
          analyticEvents={{
            onClick: {
              name: 'edx.ui.lms.button_clicked',
              properties: {
                emailOptIn,
              },
            },
          }}
        >
          Action 1
        </Button>
        <Button
          variant="primary"
          onClick={() => { console.log('Action 2 was clicked'); }}
          analyticEvents={{
            onClick: {
              name: 'edx.ui.lms.button_clicked',
              properties: {
                someProperty: 20,
              },
              dispatchers: [
                (eventName, eventProperties) => analyticsService.sendTrackingLogEvent(eventName, eventProperties),
              ],
            },
          }}
        >
          Action 2
        </Button>
      </div>
      <div className="mt-3">
        <Hyperlink
          destination="https://edx.org"
          analyticEvents={{
            onClick: {
              name: 'edx.ui.lms.link_clicked',
              properties: {
                emailOptIn,
              },
            },
          }}
        >
          Click me!
        </Hyperlink>
      </div>
    </Container>
  );
};

export default ExamplePageWithAnalytics;
