// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screen } from '@testing-library/react';
import { file, renderUpload } from './given/an_upload_surface';
import { vi } from 'vitest';

describe('when the mode is not known', () => {
    for (const mode of [7, -1, 1.5, 'Bogus', 'ADVANCED', '1', null]) {
        it(`should report ${JSON.stringify(mode)} instead of silently choosing one`, () => {
            renderUpload({ mode });
            screen.getByRole('alert').textContent!.should.contain('Unsupported mode');
        });
    }

    for (const [mode, text] of [[0, 'Choose files'], [1, 'Choose file'], ['Basic', 'Choose file'], ['Advanced', 'Choose files'], [2, 'Choose files'], ['Auto', 'Choose files'], ['auto', 'Choose files']] as const) {
        it(`should read ${JSON.stringify(mode)} as a known mode`, () => {
            renderUpload({ mode });
            screen.getByRole('button', { name: text });
            (screen.queryByRole('alert') === null).should.equal(true);
        });
    }

    for (const mode of [1, 2, 'Basic', 'Auto']) {
        it(`should upload at once when the mode is ${JSON.stringify(mode)}`, async () => {
            const handler = vi.fn().mockResolvedValue(undefined);
            renderUpload({ mode }, { handler }).choose(file('a.txt'));
            await vi.waitFor(() => handler.mock.calls.length.should.equal(1));
        });
    }
});
