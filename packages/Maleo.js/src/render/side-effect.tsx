import React from 'react';

const isServer = typeof window === 'undefined';

type Headers = Array<React.ReactElement<any>> | undefined;

interface SideEffectProps {
  reduceComponentsToState: (components: Array<React.ReactElement<any>>) => Headers;
  handleStateChange?: (headers: Headers) => void;
}

export default function sideEffect() {
  const mountedInstances: Set<any> = new Set();
  let headers: Headers;

  function emitChange(component: React.Component<SideEffectProps>) {
    headers = component.props.reduceComponentsToState([...mountedInstances]);
    if (component.props.handleStateChange) {
      component.props.handleStateChange(headers);
    }
  }

  return class SideEffect extends React.Component<SideEffectProps> {
    static rewind() {
      const recordedState = headers;
      headers = undefined;
      mountedInstances.clear();
      return recordedState;
    }

    constructor(props) {
      super(props);
      if (isServer) {
        mountedInstances.add(this);
        emitChange(this);
      }
    }

    componentDidMount() {
      mountedInstances.add(this);
      emitChange(this);
    }

    componentDidUpdate() {
      emitChange(this);
    }

    componentWillUnmount() {
      mountedInstances.delete(this);
      emitChange(this);
    }

    render() {
      return null;
    }
  };
}
