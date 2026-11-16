// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import React from 'react';
import { vi } from 'vitest';

// The editor's specifications run with `isolate: false` (one module registry per worker, for speed: full isolation made
// the suite 10-20x slower). A module evaluated by an earlier spec file would otherwise stay cached, so a later file's
// `vi.mock` of it - or of anything it imports - would silently not apply and the real module would run. Setup files run
// before each spec file, so resetting here gives every file a fresh application module graph while dependencies loaded
// by Node stay cached. Spec files must not add their own `vi.resetModules()` for this reason.
vi.resetModules();

// PrimeReact v11 throws "PrimeReactProvider not found" the moment any of its components render outside one, and the
// server-render specs (renderToStaticMarkup) deliberately render provider-free. Registering the stub once here, before any
// spec file's own `vi.mock`, avoids order-dependent flakiness from independently registered mocks sharing one registry.
vi.mock('primereact/button', () => ({
    Button: (props: { label?: string; disabled?: boolean }) =>
        React.createElement('button', { disabled: props.disabled }, props.label),
}));
