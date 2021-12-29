export { onBeforeRender };

// eslint-disable-next-line require-jsdoc
async function onBeforeRender() {
  return {
    pageContext: {
      redirectTo: "/",
    },
  };
}
