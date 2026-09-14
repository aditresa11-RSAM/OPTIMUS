import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                window.next = window.next || {};
                window.next.router = window.next.router || { components: {}, pathname: "" };
                if (!window.next.router.components) { window.next.router.components = {}; }
              } catch(e) {}
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
