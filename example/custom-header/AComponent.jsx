import React from 'react';
import { Link } from 'react-router-dom';
import Head from '@airy/maleo/head';

export default class extends React.Component {
  render() {
    return (
      <div>
        <Head>
          <title>Page A</title>
        </Head>
        <Link to="/">/</Link>
        <div>Hello A Component</div>
      </div>
    );
  }
}
