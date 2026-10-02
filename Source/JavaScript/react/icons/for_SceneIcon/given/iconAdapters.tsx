// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconAdapter, IconGlyph } from '../../index';

/**
 * Two synthetic libraries that both ship `home`, drawn differently, so a spec can see which one rendered.
 */
export const alphaHome: IconGlyph = ({ size, color }) => <svg data-testid="alpha-home" data-size={size} data-color={color} />;
export const betaHome: IconGlyph = () => <svg data-testid="beta-home" />;

export function adapterFor(library: string, glyphs: Record<string, IconGlyph>): IconAdapter & { loads: number } {
    const adapter = {
        library,
        loads: 0,
        loadGlyph: async (reference: { key: string }) => {
            adapter.loads++;
            return glyphs[reference.key];
        },
    };

    return adapter;
}
