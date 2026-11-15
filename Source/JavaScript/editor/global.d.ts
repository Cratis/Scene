// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/// <reference types="vitest/globals" />
/// <reference types="chai" />
/// <reference types="chai/register-should" />
/// <reference types="node" />

// `@cratis/scene.components` exposes its Scene-to-Cratis-Components token bridge under the bare specifier
// `./styles` rather than `./styles.css`, so `vite/client`'s `*.css` module declaration does not cover it.
declare module '@cratis/scene.components/styles';
