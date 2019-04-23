import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { HeaderProps, DocumentProps, DocumentContext } from '@interfaces/render/IRender';
import { SERVER_INITIAL_DATA, DIV_MALEO_ID } from '@constants/index';

// Extendable document
export default class Document extends React.Component<DocumentProps, {}> {
  // export class Document extends React.Component<DocumentProps, {}> implements IDocument {
  // export const Document: IDocument = class extends React.Component<DocumentProps, {}> {
  static getInitialProps = async ({
    preloadScripts,
    data,
    branch,
    html,
    head,
    ...ctx
  }: DocumentContext) => {
    return { html, head, preloadScripts, data, branch, ctx };
  };

  static childContextTypes = {
    preloadScripts: PropTypes.array.isRequired,
    html: PropTypes.element.isRequired,
    head: PropTypes.arrayOf(PropTypes.element),
    data: PropTypes.any,
    branch: PropTypes.any,
    ctx: PropTypes.any,
  };

  getChildContext = () => {
    const { preloadScripts, ctx, ...rest } = this.props;
    return { ...rest, preloadScripts, ctx };
  };

  render() {
    return (
      <html lang="en">
        <Header />

        <body>
          <Main />

          <Scripts />
        </body>
      </html>
    );
  }
}

// Preloads scripts or styles to improve performance
// as preload scripts or styles don't block the thread
export class Header extends React.Component<HeaderProps, {}> {
  static contextTypes = {
    preloadScripts: PropTypes.array.isRequired,
    head: PropTypes.arrayOf(PropTypes.element),
  };

  preloadScripts = () => {
    const { preloadScripts } = this.context;

    return preloadScripts.map((p, i) => (
      <link rel="preload" key={p.name} href={`${WEBPACK_PUBLIC_PATH}${p.filename}`} as="script" />
    ));
  };

  render() {
    const { children, ...props } = this.props;
    const { head } = this.context;

    return (
      <head lang="en" {...props}>
        {children}
        {head}
        {this.preloadScripts()}
      </head>
    );
  }
}

// Where the application lives
export class Main extends React.Component {
  static contextTypes = {
    html: PropTypes.any,
  };

  render() {
    return <div id={DIV_MALEO_ID} dangerouslySetInnerHTML={{ __html: this.context.html }} />;
  }
}

// Renders initial data as script and preloaded scripts as async
export class Scripts extends React.Component {
  static contextTypes = {
    preloadScripts: PropTypes.any,
    data: PropTypes.any,
  };

  render() {
    const { preloadScripts, data } = this.context;

    return (
      <Fragment>
        <noscript
          id={SERVER_INITIAL_DATA}
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
        {preloadScripts.map((p, i) => (
          <script key={i} src={`${WEBPACK_PUBLIC_PATH}${p.filename}`} defer />
        ))}
      </Fragment>
    );
  }
}
