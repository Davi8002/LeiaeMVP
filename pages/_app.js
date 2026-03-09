import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet='UTF-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta httpEquiv='content-language' content='pt-BR' />
        <meta name='language' content='pt-BR' />
        <meta name='google' content='notranslate' />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
