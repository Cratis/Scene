// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogPresentation } from '../../Templates/dialogPresentation';
import { dialogFrameAttributes } from '../dialogFrameAttributes';

describe('when marking the backdrop of a popup', () => {
    const dialog = dialogFrameAttributes({ presentation: DialogPresentation.Dialog, title: 'Quick create' });

    it('should say which popup it is', () => dialog['data-studio-dialog']!.should.equal('dialog'));
    it('should carry the heading for the frame to draw', () => String(dialog.style['--studio-dialog-title' as never]).should.equal('"Quick create"'));
    it('should say a drawer is one', () => dialogFrameAttributes({ presentation: DialogPresentation.Drawer })['data-studio-dialog']!.should.equal('drawer'));
    it('should carry no heading when there is none', () => ('--studio-dialog-title' in dialogFrameAttributes({ presentation: DialogPresentation.Dialog }).style).should.be.false);
    it('should mark nothing for a page', () => ('data-studio-dialog' in dialogFrameAttributes(undefined)).should.be.false);
});
