// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageHostView, PackageHostViewProps } from './PackageHostView';
import { PackageHostRenderMode } from './PackageHostRenderMode';

/** A constrained webview package host example surface. */
export function WebViewPackageHost(props: Omit<PackageHostViewProps, 'mode'>) {
    return <PackageHostView {...props} mode={PackageHostRenderMode.WebView} />;
}
