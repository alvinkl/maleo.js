import React from 'react';
import { withRouter } from 'react-router-dom';

import { AppProps, InitialProps } from '@interfaces/render';
import { renderRoutes } from '@routes/routes';
import { ManagerContext } from '@client/client-manager';

export interface AppState {
  data?: InitialProps['data'];
  // @ts-ignore
  currentLocation: Location<any> | null;
  // @ts-ignore
  previousLocation: Location<any> | null;
}

export class _App extends React.PureComponent<AppProps, AppState> {
  static contextType = ManagerContext;

  // TODO: add prefetch data for next route
  prefetchCache = {};
  routeTimeout;

  // Context Data is only for client
  // Server still passes data from props
  // TODO:
  //  - refactor to make code more consistent, use context for both server and client
  initialData = !__IS_SERVER__ ? this.context.data : this.props.data;

  state = {
    currentLocation: this.props.location,
    previousLocation: null,
  };

  componentDidMount() {
    this.initialData = null;
  }

  componentWillReceiveProps(nextProps: AppProps, nextContext) {
    const { location: nextLocation } = nextProps;
    const { location } = this.props;

    const navigated = nextLocation.pathname !== location.pathname;
    clearTimeout(this.routeTimeout);
    if (navigated) {
      const {
        clientRouteChange,
        hooks: { onBeforeRouteChange, onAfterRouteChange },
      } = this.context;

      // Run hook for before route change
      // Block render until hook finished
      onBeforeRouteChange(location, nextLocation).then(() => {
        // Wait until context has finished fetching all the initial props
        // to navigate and render new route
        clientRouteChange(nextLocation).then(() => {
          this.setState(
            {
              currentLocation: nextLocation,
              previousLocation: location,
            },
            () => {
              // Run hook for after route changes
              onAfterRouteChange(location, nextLocation);
            },
          );

          this.setState({ previousLocation: null });
        });
      });
    }
  }

  render() {
    const { previousLocation, currentLocation } = this.state;
    const { routes } = this.props;

    const data = this.initialData || this.context.data;

    const initialData = this.prefetchCache[currentLocation.pathname] || data;

    const location = previousLocation || currentLocation;

    return renderRoutes(
      routes,
      {
        initialData,
        location,
      },
      {
        location,
      },
    );
  }
}

export const App = withRouter<AppProps>(_App);
export default App;
