// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveComponentConfiguration } from './EffectiveComponentConfiguration';
import { SceneDiagnostic } from './SceneDiagnostic';

/**
 * The outcome of resolving a template chain and its instances' contributions. The runtime renders from this, and
 * the editor shows it - the same data, so what the editor shows is what Play renders.
 */
export interface EffectiveConfiguration {
    /** Every configurable component in the chain. Components nothing is exposed on are absent. */
    components: EffectiveComponentConfiguration[];

    /**
     * What went wrong: an exposure that no longer matches its component, a contribution to something no longer
     * exposed, a saved value whose type changed. The affected contributions are ignored in `components` and left
     * in the persisted data, so restoring the exposure brings the values back.
     */
    diagnostics: SceneDiagnostic[];
}

export const EffectiveConfigurationPropertyNames: (keyof EffectiveConfiguration)[] = ['components', 'diagnostics'];
