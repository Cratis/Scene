// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { rollup } from '../../../rollup.config.mjs';

import pkg from './package.json' with { type: 'json' };

import path from "path";

const cjsPath = path.dirname(pkg.main);
const esmPath = path.dirname(pkg.module);
const tsconfigPath = path.join(import.meta.dirname, "tsconfig.json");

const config = rollup(cjsPath, esmPath, tsconfigPath, pkg);

// `loadQuill/index.ts` is a second entry point (published as `./quill`): it is the only module that names
// `quill`, and nothing in the root entry imports it, so a host that renders no rich text never resolves
// `quill`. It cannot live in a folder called `quill`: the peer-dependency plugin would treat the entry as external.
config.input = ['index.ts', 'loadQuill/index.ts'];

// The shared config externalizes the exact ids in `dependencies` and `peerDependencies`, but every
// adapter here imports a PrimeReact *subpath* (`primereact/button`, `primereact/datatable`, ...), and a
// bare string in Rollup's `external` does not cover a package's submodules. Without these patterns the
// whole of PrimeReact would be inlined into a package that declares it as a peer - the consumer would
// end up with two copies, and the one inside this bundle would not see the theme the application loaded.
config.external = [...config.external, /^primereact\//, /^primeicons/];

export default config;
