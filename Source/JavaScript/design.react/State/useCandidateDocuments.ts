// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import type { SceneDocument } from '@cratis/scene.model';
import type { DesignMode, VariationGroup } from '@cratis/scene.design';
import type { ScreenplayBridge } from '../Host/DesignCanvasHost';

/** The documents of the candidates of a variation group, by candidate id; a candidate is absent until the bridge has read it. */
export function useCandidateDocuments(bridge: ScreenplayBridge, group: VariationGroup | undefined, mode: DesignMode): ReadonlyMap<string, SceneDocument> {
    const [documents, setDocuments] = useState<ReadonlyMap<string, SceneDocument>>(new Map());
    const key = group === undefined ? '' : `${group.id}|${group.candidates.map(candidate => candidate.id).join(',')}`;

    useEffect(() => {
        if (group === undefined) { setDocuments(new Map()); return undefined; }
        let stale = false;
        Promise.all(group.candidates.map(async candidate => [candidate.id, await bridge.toDocument([{ screen: group.screen, text: candidate.text }], mode)] as const))
            .then(read => { if (!stale) setDocuments(new Map(read)); }, () => { if (!stale) setDocuments(new Map()); });
        return () => { stale = true; };
        // The candidates of a group never change once proposed, so the group's key says when to read again.
    }, [key, bridge, mode]);

    return documents;
}

/** The variation group of a screen that is still being chosen from: the latest one with no choice made. */
export const openVariationGroup = (groups: readonly VariationGroup[], screen: string): VariationGroup | undefined =>
    [...groups].reverse().find(group => group.screen === screen && group.chosen === undefined);
