import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='pt-BR' translate='no'>
      <Head>
        <meta httpEquiv='content-language' content='pt-BR' />
        <meta name='language' content='pt-BR' />
        <meta name='google' content='notranslate' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
