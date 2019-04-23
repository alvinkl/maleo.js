import React from 'react';
import { Link } from 'react-router-dom';
import Head from '@airy/maleo/head';

export default class extends React.Component {
  render() {
    return (
      <div>
        <Head>
          <title>Root Page</title>
          <meta
            name="twitter:description"
            content="Dapatkan hotel dan tiket pesawat dengan harga paling murah hanya di Airy. Harga promo setiap hari, bisa bayar di Indomaret, dan tanpa biaya tambahan."
          />
        </Head>
        <Link to="/a">a</Link>
        <div>Hello Root Component</div>
      </div>
    );
  }
}
