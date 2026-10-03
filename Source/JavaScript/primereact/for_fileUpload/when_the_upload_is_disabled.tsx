// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { file, renderUpload } from './given/an_upload_surface';

describe('when the upload is disabled', () => {
    for (const mode of [0, 1, 2]) {
        describe(`and the mode is ${mode}`, () => {
            it('should disable every trigger and not take a dropped or chosen file', async () => {
                const handler = vi.fn().mockResolvedValue(undefined);
                const surface = renderUpload({ mode, url: '/uploads' }, { handler, isEnabled: false });

                surface.input.disabled.should.equal(true);
                for (const button of screen.getAllByRole('button')) (button as HTMLButtonElement).disabled.should.equal(true);

                surface.drop(file('a.txt'));
                fireEvent.click(screen.getAllByRole('button')[0]);
                await new Promise(resolve => setTimeout(resolve, 20));
                handler.mock.calls.length.should.equal(0);
            });
        });
    }

    it('should stop the browser from opening a file dropped on the zone', () => {
        const surface = renderUpload({ mode: 0, url: '/uploads' }, { isEnabled: false });
        fireEvent.dragOver(surface.zone).should.equal(false);
        fireEvent.drop(surface.zone, { dataTransfer: { files: [file('a.txt')] } }).should.equal(false);
    });
});
