// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StorybookConfig } from "@storybook/react-vite";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import type { InlineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    // Scoped to the package root only (not `**`) so this glob never reaches into `dist/`, which would
    // otherwise index both the source .stories.tsx and its own tsc-emitted .stories.js as duplicates.
    stories: ["../*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [getAbsolutePath("@storybook/addon-links")],
    framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
    async viteFinal(config: InlineConfig) {
        config.resolve = config.resolve || {};
        config.resolve.alias = {
            ...config.resolve.alias,
            '@cratis/scene.engine': resolve(__dirname, '../../engine/index.ts'),
            '@cratis/scene.model': resolve(__dirname, '../../model/index.ts'),
        };
        return config;
    },
};
export default config;

function getAbsolutePath(value: string): string {
    return dirname(fileURLToPath(import.meta.resolve(join(value, "package.json"))));
}
