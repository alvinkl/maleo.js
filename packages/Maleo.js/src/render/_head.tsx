/*
  Highly inspired from zeit/next
  The way this work is to let Head listen to the context and add component that will handle the rendering or updating of the Head children component
  for example if the children is title component, then Effect component will handle the rehydrating on client side and
  normal rendering on the server side
*/

import React from 'react';
import { HeadContext } from '@context/head-context';
import { HEAD_MALEO_CLASSNAME } from '@constants/index';
import sideEffect from './side-effect';

export function defaultHead(className = HEAD_MALEO_CLASSNAME) {
  return [
    <meta key="charSet" charSet="utf-8" className={className} />,
    <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1.0" />,
    <meta key="httpEquiv" httpEquiv="X-UA-Compatible" content="ie=edge" />,
  ];
}

function onlyReactElement(list: Array<React.ReactElement<any>>, child: React.ReactChild) {
  if (typeof child === 'string' || typeof child === 'number') {
    return list;
  }

  // Support for React.Fragment
  if (child.type === React.Fragment) {
    return list.concat(React.Children.toArray(child.props.children).reduce(onlyReactElement, []));
  }

  return list.concat(child);
}

const METATYPES = ['name', 'httpEquiv', 'charSet', 'itemProp'];

function unique() {
  const keys = new Set();
  const tags = new Set();
  const metaTypes = new Set();
  const metaCategories: { [metatype: string]: Set<string> } = {};

  return (h: React.ReactElement<any>) => {
    if (h.key && typeof h.key !== 'number' && h.key.indexOf('.$') === 0) {
      if (keys.has(h.key)) {
        return false;
      }
      keys.add(h.key);
      return true;
    }

    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) {
          return false;
        }
        tags.add(h.type);
        return true;
      case 'meta':
        for (let i = 0, len = METATYPES.length; i < len; i++) {
          const metatype = METATYPES[i];
          if (!h.props.hasOwnProperty(metatype)) {
            continue;
          }

          if (metatype === 'charSet') {
            if (metaTypes.has(metatype)) {
              return false;
            }
            metaTypes.add(metatype);
            return true;
          }

          const category = h.props[metatype];
          const categories = metaCategories[metatype] || new Set();
          if (categories.has(category)) {
            return false;
          }
          categories.add(category);
          metaCategories[metatype] = categories;
          return true;
        }
      default:
        return true;
    }
  };
}

function reduceComponents(headElements: Array<React.ReactElement<any>>) {
  const components = headElements
    .reduce((list: React.ReactChild[], headElement: React.ReactElement<any>) => {
      const headElementChildren = React.Children.toArray(headElement.props.children);

      return [...list, headElementChildren];
    }, [])
    .reduce(onlyReactElement, [])
    .reverse()
    .concat(defaultHead(''))
    .filter(unique)
    .reverse()
    .map((c: React.ReactElement<any>, i: number) => {
      const className =
        (c.props && c.props.className ? c.props.className + ' ' : '') + HEAD_MALEO_CLASSNAME;

      const key = c.key || i;

      return React.cloneElement(c, { key, className });
    });

  return components;
}

const Effect = sideEffect();

function Head({ children }: { children: React.ReactNode }) {
  return (
    <HeadContext.Consumer>
      {(updateHead) => (
        <Effect reduceComponentsToState={reduceComponents} handleStateChange={updateHead}>
          {children}
        </Effect>
      )}
    </HeadContext.Consumer>
  );
}

Head.rewind = Effect.rewind;

export default Head;
