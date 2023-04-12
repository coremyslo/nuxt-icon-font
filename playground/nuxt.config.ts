export default defineNuxtConfig({
  modules: ['../src/module'],
  iconFont: {
    base64: true,
    formats: ['woff2', "woff", "ttf", "eot", "svg"],
  }
})
