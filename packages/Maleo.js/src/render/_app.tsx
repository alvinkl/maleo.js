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
  loading: boolean;
}

function preventRouteRerender(Component) {
  class PreventRerender extends React.PureComponent<AppProps, AppState> {
    static contextType = ManagerContext;

    // TODO: add prefetch data for next route
    prefetchCache = {};
    routeTimeout;

    // Context Data is only for client
    // Server still passes data from props
    // TODO:
    //  - refactor to make code more consistent, use context for both server and client
    initialData = !__IS_SERVER__ ? this.context.data : this.props.data;
    routes = !__IS_SERVER__ ? this.context.routes : this.props.routes;

    currentLocation = this.props.location || this.context.currentLocation;
    previousLocation = null;

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
            // Run hook for after route changes
            onAfterRouteChange(location, nextLocation);
          });
        });
      }
    }

    render() {
      const { currentLocation: location = this.currentLocation } = this.context || {};

      const data = this.initialData || this.context.data;
      const initialData = this.prefetchCache[location.pathname] || data;

      return <Component routes={this.routes} initialData={initialData} location={location} />;
    }
  }

  return withRouter<AppProps>(PreventRerender);
}

const _App = React.memo((props) => {
  const { routes, initialData, location } = props;

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
});

export const App = preventRouteRerender(_App);
export default App;
