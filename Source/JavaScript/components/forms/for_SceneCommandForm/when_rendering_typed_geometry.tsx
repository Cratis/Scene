// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ArcContext } from '@cratis/arc.react';
import { FormWidthUnit } from '@cratis/scene.model';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { StartProject } from './given/StartProject';
import { successfulResponse } from './given/RecordNote';

const guid = 'AABBCCDD-1234-5678-9ABC-001122334455';
const inputs = [{ property: 'projectId', type: 'guid', label: 'Project ID' }, { property: 'name', type: 'string', label: 'Name' }];

function view(layout: Record<string, unknown>) {
    return <ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '/backend', microservice: 'projects', httpHeadersCallback: () => ({}) }}>
        <SceneElementView element={externalComponent('Cratis.Components:commandForm', { command: 'StartProject', mode: 'manual', inputs, layout, submitLabel: 'Create project' })}
            registry={cratisComponents} />
    </ArcContext.Provider>;
}

describe('when rendering typed geometry', () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    beforeEach(() => { clearBindings(); registerCommand('StartProject', StartProject); fetch.mockReset(); fetch.mockResolvedValue(successfulResponse()); vi.stubGlobal('fetch', fetch); });
    afterEach(() => { cleanup(); clearBindings(); vi.unstubAllGlobals(); });

    it('should submit valid forms rendered with unequal typed columns', async () => {
        render(view({
            columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 2 } }, { index: 2, width: { unit: FormWidthUnit.Pixels, value: 320 } }],
            placements: [{ field: 'projectId', row: 1, column: 1 }, { field: 'name', row: 1, column: 2 }],
        }));

        fireEvent.change(await screen.findByRole('textbox', { name: 'Project ID' }), { target: { value: guid } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Geometry project' } });
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Create project' })); });
        await waitFor(() => fetch.mock.calls.should.have.lengthOf(1));
        JSON.parse(String(fetch.mock.calls[0][1]!.body)).should.deep.equal({ projectId: guid.toLowerCase(), name: 'Geometry project' });
    });

    it('should block invalid draft geometry before native submit', async () => {
        render(view({
            columns: [{ index: 1 }],
            placements: [{ field: 'projectId', row: 1, column: 2 }, { field: 'name', row: 1, column: 1 }],
        }));

        (await screen.findByRole('alert')).textContent!.should.contain('extends beyond the declared columns');
        fetch.mock.calls.should.have.lengthOf(0);
    });
});
