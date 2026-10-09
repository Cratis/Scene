// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageHostView, PackageHostViewProps } from './PackageHostView';
import { PackageHostRenderMode } from './PackageHostRenderMode';

/** A standalone browser package host example surface. */
export function StandalonePackageHost(props: Omit<PackageHostViewProps, 'mode'>) {
    return <PackageHostView {...props} mode={PackageHostRenderMode.Standalone} />;
}
