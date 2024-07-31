import { Html, Head, Main, NextScript } from 'next/document'
import { ColorSchemeScript } from '@mantine/core'

export default Document;

function Document() {
  return (
    <Html lang="en">
      <Head>
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" />
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link
            rel="apple-touch-icon"
            href="/favicon?<generated>"
            type="image/<generated>"
            sizes="<generated>"
          />
          <ColorSchemeScript defaultColorScheme='auto' />
      </Head>

      <body>
          <Main />
          <NextScript />
      </body>
    </Html>
  )
}
