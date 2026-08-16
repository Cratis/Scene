// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import type { InlineConfig } from 'vite';

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
        config.build = config.build || {};
        config.build.rollupOptions = { ...(config.build.rollupOptions ?? {}), external: [/^@cratis\/arc/, '@cratis/fundamentals'] };
        return config;
    },
};
export default config;

function getAbsolutePath(value: string): string {
    return dirname(fileURLToPath(import.meta.resolve(join(value, "package.json"))));
}
