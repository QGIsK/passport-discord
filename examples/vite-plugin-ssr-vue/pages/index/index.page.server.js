/* eslint-disable require-jsdoc */
export { onBeforeRender };

async function onBeforeRender(pageContext) {
  const pageProps = {};

  pageProps.user = pageContext.user ?? null;

  return {
    pageContext: {
      pageProps,
    },
  };
}
