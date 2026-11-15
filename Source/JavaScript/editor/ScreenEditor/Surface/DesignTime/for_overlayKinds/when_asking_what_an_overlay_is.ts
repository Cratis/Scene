// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultPaletteSources } from '../../../Defaults/defaultPaletteSources';
import { OverlayKind, overlayKinds } from '../overlayKinds';

describe('when asking what an overlay component is', () => {
    it('should call a dialog a window', () => overlayKinds.dialog.should.equal(OverlayKind.Window));
    it('should call a toast a toast', () => overlayKinds.toast.should.equal(OverlayKind.Toast));
    it('should call a tooltip a tooltip', () => overlayKinds.tooltip.should.equal(OverlayKind.Tooltip));
    it('should call a block of the interface a mask', () => overlayKinds.blockUI.should.equal(OverlayKind.Mask));
    it('should call a busy indicator busy', () => overlayKinds.busyIndicatorDialog.should.equal(OverlayKind.Busy));
});

describe('when looking at every overlay the palette offers', () => {
    const offered = new Set(defaultPaletteSources.flatMap(source => source.components));

    it('should only name components the palette offers', () => Object.keys(overlayKinds).filter(name => !offered.has(name)).should.deep.equal([]));
    // The head of a dialog template is drawn where it sits, inside the dialog: it opens nothing, so it is not an overlay.
    const drawnInPlace = new Set(['dialogFrame']);
    it('should not leave a dialog out', () => [...offered].filter(name => /dialog/i.test(name) && !drawnInPlace.has(name) && overlayKinds[name] === undefined).should.deep.equal([]));
});
