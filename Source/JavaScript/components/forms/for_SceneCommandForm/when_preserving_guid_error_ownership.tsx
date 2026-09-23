// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CommandForm, useCommandFormContext } from '@cratis/arc.react/commands';
import { Guid } from '@cratis/fundamentals';
import { PropertyDescriptor } from '@cratis/arc/reflection';
import { ExplicitCommandField } from '../ExplicitCommandField';
import { StartProject } from './given/StartProject';

class OptionalProject extends StartProject {
    readonly propertyDescriptors = [new PropertyDescriptor('projectId', Guid, true), new PropertyDescriptor('name', String)];
}

const input = { property: 'projectId', type: 'guid' as const, label: 'Project ID' };

describe('native explicit Guid field error ownership', () => {
    afterEach(cleanup);

    it('leaves a caller-owned error intact when the invalid field unmounts in the same event', async () => {
        let context!: ReturnType<typeof useCommandFormContext>;
        function Capture() { context = useCommandFormContext(); return null; }
        function form(show: boolean) {
            return <CommandForm command={StartProject}><Capture />{show && <ExplicitCommandField input={input} />}</CommandForm>;
        }
        const result = render(form(true));
        fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: 'bad' } });
        context.getFieldError('projectId')!.should.equal('Project ID must be a valid GUID');
        await act(async () => {
            context.setCustomFieldError('projectId', 'Caller-owned error');
            result.rerender(form(false));
        });
        context.getFieldError('projectId')!.should.equal('Caller-owned error');
    });

    it('clears its own malformed optional Guid error on unmount', async () => {
        let context!: ReturnType<typeof useCommandFormContext>;
        function Capture() { context = useCommandFormContext(); return null; }
        function form(show: boolean) {
            return <CommandForm command={OptionalProject}><Capture />{show && <ExplicitCommandField input={input} />}</CommandForm>;
        }
        const result = render(form(true));
        await act(async () => {
            fireEvent.change(screen.getByRole('textbox', { name: 'Project ID' }), { target: { value: 'bad' } });
            context.getFieldError('projectId')!.should.equal('Project ID must be a valid GUID');
            result.rerender(form(false));
        });
        (Object.hasOwn(context.customFieldErrors, 'projectId')).should.equal(false);
    });
});
