// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StorybookConfig } from '@storybook/react-vite';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { InlineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    // Scoped away from `dist/` so a story is never indexed twice - once as source and once as the tsc-emitted copy beside it.
    stories: ['../*.stories.@(js|jsx|mjs|ts|tsx)', '../!(dist|node_modules)/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: [getAbsolutePath('@storybook/addon-links')],
    framework: { name: getAbsolutePath('@storybook/react-vite'), options: {} },
    async viteFinal(config: InlineConfig) {
        config.resolve = config.resolve || {};
        // The Scene packages the canvas is built on come from their sources, so a story and the canvas share one copy of each -
        // the binding registry and the design-system resolution are module-level state.
        config.resolve.alias = {
            ...config.resolve.alias,
            '@cratis/scene.engine': resolve(__dirname, '../../engine/index.ts'),
            '@cratis/scene.model': resolve(__dirname, '../../model/index.ts'),
            '@cratis/scene.react': resolve(__dirname, '../../react/index.ts'),
            '@cratis/scene.design': resolve(__dirname, '../../design/index.ts'),
            '@cratis/scene.editor': resolve(__dirname, '../../editor/index.ts'),
        };
        // `@cratis/arc`, `@cratis/arc.react` and `@cratis/fundamentals` are peer dependencies of `@cratis/components` that the host
        // application supplies, and development dependencies here, so they are bundled into the stories: left external they stay bare
        // specifiers (`@cratis/arc.react/dialogs`) that a browser cannot resolve, and every story fails to render. A story still has no
        // Arc client and no backend - the canvas' effects leave it through its host seams.
        return config;
    },
};
export default config;

function getAbsolutePath(value: string): string {
    return dirname(fileURLToPath(import.meta.resolve(join(value, 'package.json'))));
}
