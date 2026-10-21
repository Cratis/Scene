// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import type { InlineConfig } from 'vite';
import { styledPrimeReact } from './styledPrimeReact';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    // Scoped away from `dist/` so a story is never indexed twice - once as source and once as the
    // tsc-emitted copy beside it.
    stories: ["../*.stories.@(js|jsx|mjs|ts|tsx)", "../!(dist|node_modules)/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [getAbsolutePath("@storybook/addon-links")],
    framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
    async viteFinal(config: InlineConfig) {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias,
            '@cratis/scene.engine': resolve(__dirname, '../../engine/index.ts'),
            '@cratis/scene.model': resolve(__dirname, '../../model/index.ts'),
            '@cratis/scene.react': resolve(__dirname, '../../react/index.ts'),
        };
        // PrimeReact 11 verifies a licence key on mount. Stage supplies it from the PRIMEUI_LICENSE secret at build time; this
        // is the same variable. Absent (no key configured), the provider falls back to PrimeReact's unlicensed banner.
        config.define = { ...config.define, 'import.meta.env.SCENE_PRIMEUI_LICENSE': JSON.stringify(process.env.SCENE_PRIMEUI_LICENSE || process.env.PRIMEUI_LICENSE || '') };
        config.plugins = [...(config.plugins ?? []), styledPrimeReact()];
        return config;
    },
};
export default config;

function getAbsolutePath(value: string): string {
    return dirname(fileURLToPath(import.meta.resolve(join(value, "package.json"))));
}
