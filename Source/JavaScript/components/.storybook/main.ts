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

        // `@cratis/arc`, `@cratis/arc.react` and `@cratis/fundamentals` are peer dependencies of
        // `@cratis/components` that the *host application* supplies. A Storybook preview is not a host:
        // it has no Arc client and no backend, which is exactly the situation this package is designed
        // around, so they are not installed here.
        //
        // Every adapter that reaches them does so through a dynamic `import()`, which puts the Arc-bound
        // half of the library in its own chunk. Marking these external lets that chunk be emitted with
        // its imports left bare, instead of failing the build; no story loads the chunk, because no
        // story registers a binding. If one ever did, the chunk would fail to load in the browser and
        // the `ArcRuntimeBoundary` around it would show that - which is the same thing a real host
        // without Arc installed would see, and is worth seeing rather than hiding.
        config.build = config.build || {};
        config.build.rollupOptions = {
            ...(config.build.rollupOptions ?? {}),
            external: [/^@cratis\/arc/, '@cratis/fundamentals'],
        };
        // Vite 8 minifies CSS with lightningcss, which rejects the whole bundle over one invalid file:
        // `@cratis/components@2.9.0` ships `dist/esm/TimeMachine/Properties.css` with `//` line comments,
        // which are not CSS. esbuild's minifier tolerates them. This is an upstream defect and the
        // workaround belongs here, in preview tooling, rather than anywhere it could hide the problem -
        // remove this line once the Components package ships that file with `/* */` comments.
        config.build.cssMinify = 'esbuild';
        return config;
    },
};
export default config;

function getAbsolutePath(value: string): string {
    return dirname(fileURLToPath(import.meta.resolve(join(value, "package.json"))));
}
