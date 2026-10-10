// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { ArcContext } from '@cratis/arc.react';
import { SceneElementView } from '@cratis/scene.react';
import { clearBindings, registerCommand } from '../../bindings';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';
import { StartProject } from './given/StartProject';

const inputs = [{ property: 'projectId', type: 'guid', label: 'Project ID' }, { property: 'name', type: 'string', label: 'Name' }];
const layout = { columns: [{ index: 1 }, { index: 2 }], placements: [{ field: 'name', row: 1, column: 2 }, { field: 'projectId', row: 1, column: 1 }] };

async function renderAt(widthSizeClass: string) {
    const { container } = render(<ArcContext.Provider value={{ origin: 'https://example.test', apiBasePath: '/backend', microservice: 'projects', httpHeadersCallback: () => ({}) }}>
        <SceneElementView element={externalComponent('Cratis.Components:commandForm', { command: 'StartProject', mode: 'manual', inputs, layout, widthSizeClass, submitLabel: 'Save' })}
            registry={cratisComponents} resolveBinding={() => undefined} />
    </ArcContext.Provider>);
    await screen.findByRole('textbox', { name: 'Name' });
    const grid = container.querySelector<HTMLElement>('[data-scene-form-columns]')!;
    const cells = [...grid.children] as HTMLElement[];
    return { columns: grid.getAttribute('data-scene-form-columns'), placements: cells.map(cell => [cell.querySelector('input')!.name, cell.style.gridRow, cell.style.gridColumn]) };
}

describe('when rendering a manual command form layout at each width', () => {
    beforeEach(() => { clearBindings(); registerCommand('StartProject', StartProject); });
    afterEach(() => { cleanup(); clearBindings(); });

    it('should place the fields side by side at a regular width', async () =>
        (await renderAt('Regular')).should.deep.equal({ columns: '2', placements: [['projectId', '1 / span 1', '1 / span 1'], ['name', '1 / span 1', '2 / span 1']] }));

    it('should stack the fields in reading order at a compact width', async () =>
        (await renderAt('Compact')).should.deep.equal({ columns: '1', placements: [['projectId', '1 / span 1', '1 / span 1'], ['name', '2 / span 1', '1 / span 1']] }));
});
