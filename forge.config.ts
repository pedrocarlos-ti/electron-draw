import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
  packagerConfig: {
    name: "ElectronDraw",
    executableName: "ElectronDraw",
    icon: "./src/assets/pencil.png",
    appBundleId: "com.electrondraw.app",
    appCategoryType: "public.app-category.graphics-design",
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}),
    new MakerDeb({}),
    new MakerDMG({
      format: 'ULFO',
      icon: './src/assets/pencil.icns',
      background: './src/assets/dmg-background.png',
      contents: [
        {
          x: 130,
          y: 220,
          type: 'file',
          path: './out/ElectronDraw-darwin-x64/ElectronDraw.app'
        },
        {
          x: 410,
          y: 220,
          type: 'link',
          path: '/Applications'
        }
      ]
    })
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/renderer/index.html',
            js: './src/renderer/index.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts'
            }
          }
        ]
      }
    })
  ]
};

export default config;
