// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { UiProfile } from '@cratis/scene.model';
import { resolveDesignTimeHost, type DesignTimeHost, type ScenePackageBundle } from '@cratis/scene.react';
import { studioEditorKinds } from './studioEditorKinds';

// Scene's design-time host over the packages the editor is lent. Scene decides which package contributions load - their
// manifest declares them, against a contract version the host implements - and reports every one it refuses, so the
// editor carries no list of packages and no switch over their designers, editors or actions. The packages are compiled
// into the host, which is why their executable contributions are allowed; network assets are not.
export function createDesignTimeHost(bundles: ScenePackageBundle[], profile: UiProfile): DesignTimeHost {
    return resolveDesignTimeHost(
        { bundles, profile: withoutLayoutOfTheDocument(bundles, profile), policy: { allowExecutableImports: true, allowNetworkAssets: false, loadDesignTime: true } },
        { hostEditorKinds: [...studioEditorKinds] });
}

// An application with a shell of its own stores that layout's name in its UI profile, but the layout is declared in the application's document, not provided by a
// package. Scene resolves the profile's layout among the approved packages' layouts and, finding none, blocks the whole profile - so no package would be approved and
// every package designer, editor and action would say its package is "not approved by this host". The packages are approved from the packages the profile lists;
// the layout is the document's, so it is left out of what the packages are approved against.
function withoutLayoutOfTheDocument(bundles: ScenePackageBundle[], profile: UiProfile): UiProfile {
    // Only a package the profile lists can provide the layout: a blueprint that is merely lent to the editor (and may declare a layout of the same name, as the default
    // blueprint declares AppShell) does not make the layout the packages' own.
    const listed = new Set(profile.packages);
    if (!profile.layout || bundles.some(bundle => listed.has(bundle.manifest.name) && (bundle.layouts ?? []).some(layout => layout.name === profile.layout))) {
        return profile;
    }

    return { ...profile, layout: undefined };
}
