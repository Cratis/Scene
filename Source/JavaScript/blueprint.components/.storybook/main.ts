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
        // The two packages this blueprint is built on are aliased alongside the three it shares with every
        // other package here. Without that, `@cratis/scene.components` would come from its built `dist`
        // while the engine and the React renderer came from source - and the binding registry is
        // module-level state, so a story registering a fake through one copy would be invisible to the
        // adapter reading the other.
        config.resolve.alias = {
            ...config.resolve.alias,
            '@cratis/scene.engine': resolve(__dirname, '../../engine/index.ts'),
            '@cratis/scene.model': resolve(__dirname, '../../model/index.ts'),
            '@cratis/scene.react': resolve(__dirname, '../../react/index.ts'),
            '@cratis/scene.components': resolve(__dirname, '../../components/index.ts'),
            '@cratis/scene.blueprint.default': resolve(__dirname, '../../blueprint.default/index.ts'),
        };
        // `@cratis/arc`, `@cratis/arc.react` and `@cratis/fundamentals` are peer dependencies of
        // `@cratis/components` that the *host application* supplies. A Storybook preview is not a host: it
        // has no Arc client and no backend, which is exactly the situation these templates are designed
        // around, so they are not installed here.
        //
        // Every Arc-bound adapter reaches them through a dynamic `import()`, which puts that half of the
        // library in its own chunk. Marking these external lets the chunk be emitted with its imports left
        // bare instead of failing the build. A story that registers a binding will make the browser fail to
        // load that chunk and the `ArcRuntimeBoundary` around it will say so - which is the same thing a
        // real host without Arc installed sees, and is worth seeing rather than hiding.
        config.build = config.build || {};
        config.build.rollupOptions = {
            ...(config.build.rollupOptions ?? {}),
            external: [/^@cratis\/arc/, '@cratis/fundamentals'],
        };
        return config;
    },
};
export default config;

function getAbsolutePath(value: string): string {
    return dirname(fileURLToPath(import.meta.resolve(join(value, "package.json"))));
}
