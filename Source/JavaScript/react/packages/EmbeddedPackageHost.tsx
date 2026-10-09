// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageHostView, PackageHostViewProps } from './PackageHostView';
import { PackageHostRenderMode } from './PackageHostRenderMode';

/** An embedded package host example surface for application or designer panes. */
export function EmbeddedPackageHost(props: Omit<PackageHostViewProps, 'mode'>) {
    return <PackageHostView {...props} mode={PackageHostRenderMode.Embedded} />;
}
