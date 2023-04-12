# @coremyslo/nuxt-icon-font

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt icon font generator

---

**Note:** This is **Nuxt 3** compatible module only.

---

## Features
- 🕵️‍♂️&nbsp;Watches specified folder (and sub-folders) with SVG icons and generates fonts on change
- 💅&nbsp;Optimizes SVG files via [SVGO](https://www.npmjs.com/package/svgo)
- 🤯&nbsp;Manual or [browserslist](https://www.npmjs.com/package/browserslist) based auto-detection  of font formats to generate
- 🏗️&nbsp;Generates and injects custom properties (variables) with icon codes into pages, where SVG file name is used as a variable name
- ❤️&nbsp;Detects and generates the most popular font format as base64 to reduce page jump effect

## Usage
``` html
<template>
  <a>I'm a link with icon!</a>
</template>
<style scoped lang="scss">
  a {
    &:before {
      content: var(--icon-font-home);
      font-family: "icon-font";
    }
  }
</style>
```

![](playground/assets/icon-font/home.svg) I'm a link with icon!


## Setup

1. Add `@coremyslo/nuxt-icon-font` dependency to your project

```bash
# Using pnpm
pnpm add -D @coremyslo/nuxt-icon-font

# Using yarn
yarn add --dev @coremyslo/nuxt-icon-font

# Using npm
npm install --save-dev @coremyslo/nuxt-icon-font
```

2. Add `my-module` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    "@coremyslo/nuxt-icon-font"
  ]
})
```

3. [Optional] Configure for your needs in `nuxt.config.ts`. Below is the default configuration.
```js
export default defineNuxtConfig({
  // ...
  iconFont: {
    // Font name to be used in "font-family" and custom properties generated prefix "--icon-font-svgiconfilename"
    name: "icon-font",
    // folder with icons to watch
    sourceDirPath: "assets/icon-font",
    // target folder for generated fonts in "public" folder
    targetDirPath: "icon-font",
    // font formats to generate, fallback to ["woff2"] in case browserslist is not used, example for manual configuration: ["svg", "ttf", "woff", "woff2", "eot"] in any order
    formats: getFontFormatsList(browserslist()),
    // Support of generating the most popular font as base64
    base64: false,
    // unicode symbol for first icon in iconfont (makes sense to change only if you're not going to use custom properties)
    unicode: "0xE900",
    // generated custom properties (variables) format. Other options are: "snake", "pascal", "camel", "header", "constant"
    case: "kebab"
  }
})
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@coremyslo/nuxt-icon-font/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@coremyslo/nuxt-icon-font

[npm-downloads-src]: https://img.shields.io/npm/dm/@coremyslo/nuxt-icon-font.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@coremyslo/nuxt-icon-font

[license-src]: https://img.shields.io/npm/l/@coremyslo/nuxt-icon-font.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@coremyslo/nuxt-icon-font

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
