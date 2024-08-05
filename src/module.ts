import { relative, resolve } from 'node:path'
import { IconGenerator } from '@coremyslo/icon-generator';
import { FontGenerator } from '@coremyslo/font-generator';
import { AssetGenerator } from "@coremyslo/asset-generator";
import { getFontFormatsList } from "fontslist";
import browserslist from "browserslist";
import { defineNuxtModule, createResolver, addTemplate } from '@nuxt/kit'
import { FontFormat } from "fontslist/dist/types";
import { Case } from "@coremyslo/icon-generator/dist/types";
import toCase from "case";
import { clearTimeout } from "timers";

const formatOrder = ["eot", "woff2", "woff", "ttf", "svg"];

export interface ModuleOptions {
  name: string,
  sourceDirPath: string,
  targetDirPath: string,
  base64: boolean
  formats: FontFormat[],
  unicode: string,
  case: Case,
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@coremyslo/nuxt-icon-font',
    configKey: 'iconFont',
    compatibility: {
      nuxt: '>=3.0.0'
    }
  },
  defaults: {
    name: "icon-font",
    sourceDirPath: "assets/icon-font",
    targetDirPath: "icon-font",
    formats: getFontFormatsList(browserslist(), true),
    base64: true,
    unicode: FontGenerator.optionsDefault.unicode,
    case: IconGenerator.optionsDefault.case,
  },
  async setup (options, nuxt) {
    // very weird merging of defaults. To investigate later
    options.formats = [...new Set(options.formats)];

    options.formats.sort((a,b) => {
      return formatOrder.indexOf(a) - formatOrder.indexOf(b)
    })

    const { resolve } = createResolver(import.meta.url)

    const sourceDirPath = resolve(nuxt.options.rootDir, options.sourceDirPath);
    const targetDirPath = resolve(nuxt.options.rootDir, nuxt.options.dir.public ,options.targetDirPath);

    const iconGenerator= new IconGenerator(sourceDirPath);
    await iconGenerator.read();

    const fontGenerator= new FontGenerator({
      name: options.name,
      formats: options.formats,
      unicode: options.unicode,
    });
    await fontGenerator.generate(iconGenerator.icons);
    await fontGenerator.write(targetDirPath);

    const assetGenerator = new AssetGenerator({
      assets: [
        ":root {\n" +
        "  ${[...state.icons.keys()].map((name, i) => `--${state.toCase[state.options.case](`${state.options.name}-${name}`)}: \"\\\\${(Number(state.options.unicode) + i).toString(16)}\";\n" +
        "  `).join('')}\n" +
        "}\n",
        "@font-face {\n" +
        "  font-family: \"${state.options.name}\";\n" +
        "  ${state.fontFaceSrc};\n" +
        "  font-weight: normal;\n" +
        "  font-style: normal;\n" +
        "}\n"
      ]
    })
    await assetGenerator.read();
    const getFontFaceSrc = () => {
      let text = "src: ";
      const meta: Record<FontFormat, Partial<Record<"data"|"format"|"hash", string>>> = {
        woff2: {
          data: "application/font-woff2",
        },
        woff: {
          data: "application/font-woff",
        },
        ttf: {
          data: "font/truetype",
          format: "truetype",
        },
        svg: {
          data: "image/svg+xml",
          hash: options.name,
        },
        eot: {
          data: "application/vnd.ms-fontobject",
          format: "embedded-opentype",
          hash: "iefix",
        },
      };
      options.formats.slice().forEach((value, index) => {
        const font = fontGenerator.fonts.get(value);
        const url = `${targetDirPath}/${options.name}`.replace(new RegExp(`^.*\/${nuxt.options.dir.public}\/`), "");
        if (font) {
          if (options.base64) {
            if (value === "woff") {
              const base64 = Buffer.from(font.value).toString("base64");
              text += `url(data:${meta[value].data};charset=utf-8;base64,${base64}) format('${meta[value].format || value}')`;
            }
          } else {
            if (index === 0) {
              if (value === "eot") {
                text += `url(/'${url}.eot?${font.uuid}');\n`;
                text += "  src: ";
              }
            } else {
              text += ",\n     ";
            }
            text += `url('/${url}.${value}?${font.uuid}${meta[value].hash ? `#${meta[value].hash}` : ""}') format('${meta[value].format || value}')`;
          }
        }
      });
      return text;
    }
    await assetGenerator.generate({
      options,
      toCase,
      icons: iconGenerator.icons,
      fontFaceSrc: getFontFaceSrc()
    });
    addTemplate({
      filename: "icon-font/vars.css",
      write: true,
      getContents: () => assetGenerator.assets[0],
    });
    addTemplate({
      filename: "icon-font/font-face.css",
      write: true,
      getContents: () => assetGenerator.assets[1],
    });

    nuxt.options.css.push("#build/icon-font/vars.css");
    nuxt.options.css.push("#build/icon-font/font-face.css");

    let timeout: ReturnType<typeof setTimeout>;

    nuxt.hook("builder:watch", async (event, path) => {
      path = relative(nuxt.options.srcDir, resolve(nuxt.options.srcDir, path))
      if (!path.includes(options.sourceDirPath || "") || !path.match(/\.(svg)$/)) {
        return;
      }
      if (event === "add") {
        await iconGenerator.read(resolve(nuxt.options.rootDir, path));
      }
      if (event === "unlink") {
        await iconGenerator.delete(resolve(nuxt.options.rootDir, path));
      }
      if (event === "change") {
        await iconGenerator.update(resolve(nuxt.options.rootDir, path));
      }
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        await fontGenerator.generate(iconGenerator.icons);
        await fontGenerator.write(targetDirPath);
        await assetGenerator.generate({
          options,
          toCase,
          icons: iconGenerator.icons,
          fontFaceSrc: getFontFaceSrc()
        });
        await nuxt.callHook("builder:generateApp");
      }, 100);
    });
  }
})
