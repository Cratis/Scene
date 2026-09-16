// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, render, screen } from '@testing-library/react';
import { expect, vi } from 'vitest';
import { externalComponent } from '../../../given';

// The public Components radio props require a native group name independently of the display title.
describe('when mapping the radio group name', () => {
    const received = vi.fn<(props: { name: string; title: string; value: (instance: Record<string, unknown>) => unknown }) => void>();
    let SceneRadioButtonField: typeof import('../SceneRadioButtonField').SceneRadioButtonField;

    beforeEach(async () => {
        vi.resetModules();
        received.mockClear();
        vi.doMock('@cratis/components/CommandForm', () => ({
            RadioButtonField: (props: Parameters<typeof received>[0]) => { received(props); return <input type='radio' name={props.name} />; },
        }));
        ({ SceneRadioButtonField } = await import('../SceneRadioButtonField'));
    });

    afterEach(() => {
        cleanup();
        vi.doUnmock('@cratis/components/CommandForm');
        vi.resetModules();
    });

    it('should group options by the explicit property, regardless of titles or labels', async () => {
        await act(async () => {
            render(<>{['First title', 'Second title'].map((title, index) => <SceneRadioButtonField key={title} element={externalComponent('Cratis.Components:radioButtonField', { property: 'choice', title, label: 'Display label', buttonValue: index })} slots={{}} />)}</>);
        });
        expect(screen.getAllByRole('radio').map(radio => radio.getAttribute('name'))).toEqual(['choice', 'choice']);
        expect(received.mock.calls.map(([props]) => props.value({ choice: 2 }))).toEqual([2, 2]);
    });

    for (const property of [undefined, 42, null, {}, []]) {
        it(`should visibly reject malformed property ${JSON.stringify(property)} instead of using the title`, async () => {
            await act(async () => {
                render(<SceneRadioButtonField element={externalComponent('Cratis.Components:radioButtonField', { property, title: 'Not a binding' })} slots={{}} />);
            });
            expect(screen.getByText("Missing 'property' on Cratis.Components:radioButtonField")).toBeTruthy();
            expect(received).not.toHaveBeenCalled();
        });
    }
});
