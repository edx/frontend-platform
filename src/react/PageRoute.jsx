/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { Route, useRouteMatch } from 'react-router-dom';
import { sendPageEvent } from '../analytics';

/**
 * A react-router Route component that calls `sendPageEvent` when it becomes active.
 *
 * @see {@link module:frontend-platform/analytics~sendPageEvent}
 * @memberof module:React
 * @param {Object} props
 */
export default function PageRoute(props) {
  const match = useRouteMatch({
    path: props.path,
    exact: props.exact,
    strict: props.strict,
    sensitive: props.sensitive,
  });

  useEffect(() => {
    if (match) {
      sendPageEvent();
    }
  }, [JSON.stringify(match)]);
  return (
    <Route {...props} />
  );
}
