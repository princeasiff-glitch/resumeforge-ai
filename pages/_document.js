import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6c63ff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ResumeForge AI" />
        <meta name="description" content="Build country-specific ATS-optimized resumes for any job, anywhere." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
