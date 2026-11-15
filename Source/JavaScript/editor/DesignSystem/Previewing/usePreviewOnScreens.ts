// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef, useState } from 'react';
import type { DesignSystemPreviewHost } from '../DesignSystemHost';
import type { DesignSystemPreview } from './DesignSystemPreview';

/**
 * Previewing the draft on the host's screens. The pictures are drawn when asked for, not when the page opens - drawing takes the
 * host a few seconds - and nothing is recorded. Asking twice while one is being drawn does nothing.
 *
 * @param host What draws the screens.
 * @returns The preview once asked for, whether it failed, whether it is being drawn, and the action.
 */
export const usePreviewOnScreens = (host: DesignSystemPreviewHost) => {
    const [preview, setPreview] = useState<DesignSystemPreview | undefined>();
    const [failed, setFailed] = useState(false);
    const [drawing, setDrawing] = useState(false);
    const inFlight = useRef(false);

    const draw = async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setDrawing(true);
        setFailed(false);
        try {
            setPreview(await host.draw());
        } catch {
            setFailed(true);
        } finally {
            inFlight.current = false;
            setDrawing(false);
        }
    };

    return { preview, failed, drawing, draw };
};
