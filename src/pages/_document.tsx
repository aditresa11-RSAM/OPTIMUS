import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  window.__NEXT_PROXY_GUARDED__ = true;
                  var fallbackRouter = { components: {}, pathname: typeof location !== "undefined" ? location.pathname : "/" };
                  var wrapNext = function(obj) {
                    if (!obj || typeof obj !== "object") return obj;
                    return new Proxy(obj, {
                      get: function(target, prop, receiver) {
                        var val = Reflect.get(target, prop, receiver);
                        if (prop === "router") {
                          if (!val) return fallbackRouter;
                          if (!val.components) val.components = {};
                          return val;
                        }
                        return val;
                      }
                    });
                  };
                  var currentNext = wrapNext(window.next || { router: fallbackRouter });
                  Object.defineProperty(window, "next", {
                    configurable: true,
                    enumerable: true,
                    get: function() { return currentNext; },
                    set: function(v) { currentNext = wrapNext(v); }
                  });
                } catch(e) {}
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
