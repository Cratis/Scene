// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import sinon from 'sinon';
import { afterEach } from 'vitest';
import { ActivityFeed, ApprovalChainStepper, AvatarStack, ChartWrapper, ChecklistSection, ColumnChooser, FileUploader, FileUploaderHandlerProvider, FilterBuilder, OrgTree, PermissionMatrix, SavedViewsMenu, foundationElement, foundationSamples } from '../foundation';
import { ComponentName } from '../ComponentName';
import { violationsIn } from '../for_foundation/given';

const outputs = () => {
    const published: Record<string, unknown> = {};
    return { published, bindingOutputs: { setOutput: (name: string, value: unknown) => { published[name] = value; }, clearOutput: () => undefined, clearAll: () => undefined } };
};

const summary = () => document.querySelector('.foundation-filter-summary')!.textContent!;

describe('when using the foundation controls', () => {
    afterEach(cleanup);

    describe('and building a filter', () => {
        const mount = (properties?: Record<string, unknown>) => {
            const { published, bindingOutputs } = outputs();
            const onChange = sinon.spy();
            const view = render(<FilterBuilder element={foundationElement(ComponentName.FilterBuilder, { ...foundationSamples[ComponentName.FilterBuilder].properties, ...properties })} slots={{}} bindingOutputs={bindingOutputs} interactions={{ onChange }} />);
            return { published, onChange, ...view };
        };

        it('should publish the filter it was given as its value', () => {
            const { published } = mount();
            (published.value as { conditions: unknown[] }).conditions.length.should.equal(2);
        });

        it('should add a condition on the first field and publish it', () => {
            const { published, onChange } = mount({ filter: undefined });
            fireEvent.click(screen.getByRole('button', { name: 'Add condition' }));
            (published.value as { conditions: { field: string; operator: string }[] }).conditions.should.deep.equal([{ field: 'owner', operator: 'contains', value: '' }]);
            onChange.callCount.should.equal(1);
        });

        it('should offer the operators of the chosen field type and reset the value when the field changes', () => {
            const { published } = mount();
            fireEvent.change(screen.getByLabelText('Field, Condition 2'), { target: { value: 'value' } });
            const operators = Array.from(screen.getByLabelText('Operator, Condition 2').querySelectorAll('option')).map(option => option.value);
            operators.should.deep.equal(['equals', 'notEquals', 'greater', 'greaterOrEqual', 'less', 'lessOrEqual']);
            (published.value as { conditions: { value: string }[] }).conditions[1].value.should.equal('');
        });

        it('should join the conditions with OR when asked', () => {
            const { published } = mount();
            fireEvent.change(screen.getAllByLabelText('Match all (AND)')[0], { target: { value: 'or' } });
            (published.value as { operator: string }).operator.should.equal('or');
        });

        it('should nest a group, remove a condition and clear everything', () => {
            const { published } = mount();
            fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
            (published.value as { groups: unknown[] }).groups.length.should.equal(1);
            fireEvent.click(screen.getAllByRole('button', { name: /Remove condition/ })[0]);
            summary().should.equal('1 active filter');
            fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
            summary().should.equal('0 active filters');
        });

        it('should not allow editing when the edit permission is not enabled', () => {
            mount({ editPermission: 'disabled' });
            (screen.queryByRole('button', { name: 'Add condition' }) === null).should.equal(true);
            (screen.getByLabelText('Field, Condition 1') as HTMLSelectElement).disabled.should.equal(true);
        });

        it('should leave a built filter without accessibility violations', async () => {
            const { container } = mount();
            fireEvent.click(screen.getByRole('button', { name: 'Add group' }));
            (await violationsIn(container)).should.deep.equal([]);
        });
    });

    describe('and choosing columns', () => {
        const mount = () => {
            const { published, bindingOutputs } = outputs();
            const view = render(<ColumnChooser element={foundationElement(ComponentName.ColumnChooser)} slots={{}} bindingOutputs={bindingOutputs} />);
            return { published, ...view };
        };

        it('should publish the visible columns in order', () => (mount().published.value as string[]).should.deep.equal(['name', 'owner']));

        it('should keep the list closed until the button is pressed, and close it with escape returning focus', () => {
            const { container } = mount();
            const button = screen.getByRole('button', { name: /Columns/ });
            button.getAttribute('aria-expanded')!.should.equal('false');
            fireEvent.click(button);
            button.getAttribute('aria-expanded')!.should.equal('true');
            fireEvent.keyDown(container.querySelector('.foundation-popover')!, { key: 'Escape' });
            button.getAttribute('aria-expanded')!.should.equal('false');
            (document.activeElement === button).should.equal(true);
        });

        it('should show a column, refuse to hide a locked one and reorder with buttons', () => {
            const { published } = mount();
            fireEvent.click(screen.getByRole('button', { name: /Columns/ }));
            fireEvent.click(screen.getByLabelText('Status'));
            (published.value as string[]).should.deep.equal(['name', 'owner', 'status']);
            (screen.getByLabelText(/^Name/) as HTMLInputElement).disabled.should.equal(true);
            fireEvent.click(screen.getByRole('button', { name: 'Move Owner up' }));
            (published.value as string[]).should.deep.equal(['owner', 'name', 'status']);
            (screen.getByRole('button', { name: 'Move Owner up' }) as HTMLButtonElement).disabled.should.equal(true);
        });
    });

    describe('and choosing a saved view', () => {
        const mount = (properties?: Record<string, unknown>) => {
            const { published, bindingOutputs } = outputs();
            const interactions = { onSelect: sinon.spy(), onClick: sinon.spy() };
            const view = render(<SavedViewsMenu element={foundationElement(ComponentName.SavedViewsMenu, { ...foundationSamples[ComponentName.SavedViewsMenu].properties, ...properties })} slots={{}} bindingOutputs={bindingOutputs} interactions={interactions} />);
            return { published, interactions, ...view };
        };

        it('should label the button with the active view and publish its id', () => {
            const { published } = mount();
            screen.getByRole('button', { name: /Saved views:\s*Mine/ });
            (published.value as string).should.equal('mine');
        });

        it('should open on arrow down, move focus with the arrows, choose with enter-click and return focus to the button', () => {
            const { published, interactions } = mount();
            const button = screen.getByRole('button', { name: /Saved views/ });
            fireEvent.keyDown(button, { key: 'ArrowDown' });
            const items = screen.getAllByRole('menuitemradio');
            (document.activeElement === items[0]).should.equal(true);
            fireEvent.keyDown(items[0], { key: 'ArrowDown' });
            (document.activeElement === items[1]).should.equal(true);
            fireEvent.keyDown(items[1], { key: 'End' });
            (document.activeElement === screen.getByRole('menuitem', { name: 'Manage views' })).should.equal(true);
            fireEvent.click(items[2]);
            (published.value as string).should.equal('overdue');
            interactions.onSelect.callCount.should.equal(1);
            (document.activeElement === button).should.equal(true);
        });

        it('should mark the active view as checked', () => {
            mount();
            fireEvent.click(screen.getByRole('button', { name: /Saved views/ }));
            screen.getAllByRole('menuitemradio').map(item => item.getAttribute('aria-checked')).should.deep.equal(['false', 'true', 'false']);
        });

        it('should publish the action a menu command asks for', () => {
            const { published, interactions } = mount();
            fireEvent.click(screen.getByRole('button', { name: /Saved views/ }));
            fireEvent.click(screen.getByRole('menuitem', { name: 'Save current view' }));
            (published.action as string).should.equal('save');
            interactions.onClick.callCount.should.equal(1);
        });

        it('should apply the permission rule to each command', () => {
            const { published } = mount({ savePermission: 'disabled', managePermission: 'hidden' });
            fireEvent.click(screen.getByRole('button', { name: /Saved views/ }));
            fireEvent.click(screen.getByRole('menuitem', { name: 'Save current view' }));
            (published.action === undefined).should.equal(true);
            screen.getByRole('menuitem', { name: 'Save current view' }).getAttribute('aria-disabled')!.should.equal('true');
            (screen.queryByRole('menuitem', { name: 'Manage views' }) === null).should.equal(true);
        });
    });

    describe('and drawing charts', () => {
        const draw = (kind: string) => render(<ChartWrapper element={foundationElement(ComponentName.ChartWrapper, { ...foundationSamples[ComponentName.ChartWrapper].properties, kind })} slots={{}} />);

        it('should draw each kind with its own marks', () => {
            draw('line').container.querySelectorAll('polyline').length.should.equal(2);
            cleanup();
            draw('bar').container.querySelectorAll('.foundation-chart-bar').length.should.equal(8);
            cleanup();
            draw('stacked').container.querySelectorAll('.foundation-chart-bar').length.should.equal(8);
            cleanup();
            draw('donut').container.querySelectorAll('.foundation-chart-slice').length.should.equal(4);
            cleanup();
            draw('funnel').container.querySelectorAll('.foundation-chart-bar').length.should.equal(4);
        });

        it('should draw a line chart for a kind it does not know', () => draw('radar').container.querySelectorAll('polyline').length.should.equal(2));

        it('should hide the drawing from assistive technology and offer the same numbers as a table', () => {
            const { container } = draw('bar');
            container.querySelector('svg.foundation-chart-plot')!.getAttribute('aria-hidden')!.should.equal('true');
            const table = container.querySelector('table')!;
            within(table).getAllByRole('row', { hidden: true }).length.should.equal(5);
            table.textContent!.should.contain('240');
        });

        it('should name each series in the legend and tell them apart by more than color', () => {
            const { container } = draw('line');
            Array.from(container.querySelectorAll('.foundation-chart-legend li')).map(item => item.textContent).should.deep.equal(['Revenue', 'Target']);
            (container.querySelector('polyline[stroke-dasharray="6 3"]') === null).should.equal(false);
        });

        it('should leave every kind without accessibility violations', async () => {
            for (const kind of ['line', 'bar', 'stacked', 'donut', 'funnel']) {
                const { container } = draw(kind);
                (await violationsIn(container)).should.deep.equal([]);
                cleanup();
            }
        });
    });

    describe('and ticking tasks', () => {
        const mount = (properties?: Record<string, unknown>) => {
            const { published, bindingOutputs } = outputs();
            const onChange = sinon.spy();
            const view = render(<ChecklistSection element={foundationElement(ComponentName.ChecklistSection, { ...foundationSamples[ComponentName.ChecklistSection].properties, ...properties })} slots={{}} bindingOutputs={bindingOutputs} interactions={{ onChange }} />);
            return { published, onChange, ...view };
        };

        it('should publish the done tasks and report each progress bar in words', () => {
            const { published } = mount();
            (published.value as string[]).should.deep.equal(['t1']);
            screen.getByRole('progressbar', { name: 'Progress of Before day one' }).getAttribute('aria-valuetext')!.should.equal('1 of 2 complete');
        });

        it('should say overdue in words for an open task past its day, and for no other', () => {
            const { container } = mount();
            container.querySelectorAll('.foundation-overdue').length.should.equal(1);
            container.querySelector('[data-overdue="true"]')!.textContent!.should.contain('Order a laptop');
            container.querySelector('[data-overdue="true"]')!.textContent!.should.contain('Overdue');
        });

        it('should tick a task, publish it, and move the progress', () => {
            const { published, onChange } = mount();
            fireEvent.click(screen.getByLabelText('Order a laptop'));
            (published.value as string[]).should.deep.equal(['t1', 't2']);
            screen.getByRole('progressbar', { name: 'Progress of Before day one' }).getAttribute('aria-valuenow')!.should.equal('2');
            onChange.callCount.should.equal(1);
        });

        it('should not let a read-only checklist be ticked', () => {
            mount({ editPermission: 'disabled' });
            (screen.getByLabelText('Order a laptop') as HTMLInputElement).disabled.should.equal(true);
        });

        it('should format due dates for the locale', () => {
            const { container } = mount({ locale: 'de-DE' });
            container.querySelector('time')!.textContent!.should.equal('01.03.2026');
        });
    });

    describe('and reading the activity of a record', () => {
        const feed = (properties?: Record<string, unknown>) => render(<ActivityFeed element={foundationElement(ComponentName.ActivityFeed, { ...foundationSamples[ComponentName.ActivityFeed].properties, ...properties })} slots={{}} />);

        it('should group entries under a heading for each day, newest first', () => {
            const { container } = feed();
            Array.from(container.querySelectorAll('.foundation-activity-heading')).map(heading => heading.textContent).should.deep.equal(['Tuesday, March 10, 2026', 'Monday, March 9, 2026']);
            container.querySelector('.foundation-activity-entry')!.textContent!.should.contain('Ada Lovelace');
        });

        it('should name the kind of an entry in words', () => {
            const { container } = feed();
            container.querySelector('[data-kind="comment"]')!.textContent!.should.contain('Comment: ');
        });

        it('should read oldest first when asked', () => {
            const { container } = feed({ order: 'ascending' });
            container.querySelector('.foundation-activity-entry')!.textContent!.should.contain('marked the deal as qualified');
        });

        it('should say there is no activity in its own words when empty', () => {
            const { container } = feed({ entries: [] });
            container.querySelector('.foundation-empty-headline')!.textContent!.should.equal('No activity yet');
        });
    });

    describe('and stacking avatars', () => {
        it('should show the maximum, fold the rest into a count in words, and label the group', () => {
            const { container } = render(<AvatarStack element={foundationElement(ComponentName.AvatarStack)} slots={{}} />);
            screen.getByRole('group', { name: '6 people' });
            container.querySelectorAll('.foundation-avatar').length.should.equal(5);
            screen.getByRole('img', { name: '2 more' });
            screen.getByRole('img', { name: 'Ada Lovelace' }).textContent!.should.equal('AL');
        });

        it('should draw a picture when there is one', () => {
            const { container } = render(<AvatarStack element={foundationElement(ComponentName.AvatarStack, { people: [{ name: 'Ada', imageUrl: 'ada.png' }] })} slots={{}} />);
            container.querySelector('img')!.getAttribute('src')!.should.equal('ada.png');
        });
    });

    describe('and uploading files', () => {
        const pdf = (name: string, size = 10) => new File([new Uint8Array(size)], name, { type: 'application/pdf' });
        const mount = (handler?: (files: File[], url?: string) => Promise<void>, properties?: Record<string, unknown>) => {
            const { published, bindingOutputs } = outputs();
            const view = render(<FileUploaderHandlerProvider handler={handler}><FileUploader element={foundationElement(ComponentName.FileUploader, { ...foundationSamples[ComponentName.FileUploader].properties, ...properties })} slots={{}} bindingOutputs={bindingOutputs} /></FileUploaderHandlerProvider>);
            return { published, ...view, input: view.container.querySelector('input[type="file"]') as HTMLInputElement };
        };

        it('should publish what was chosen and list it with a status in words', () => {
            const { published, input } = mount();
            fireEvent.change(input, { target: { files: [pdf('a.pdf')] } });
            (published.value as { name: string; status: string }[]).should.deep.equal([{ name: 'a.pdf', size: 10, type: 'application/pdf', status: 'queued' }]);
            screen.getByText('Ready to upload');
        });

        it('should refuse a file of the wrong type or too large and say so', () => {
            const { published, input } = mount(undefined, { maxSizeMb: 0.00001 });
            fireEvent.change(input, { target: { files: [new File(['x'], 'notes.txt', { type: 'text/plain' }), pdf('big.pdf', 1000)] } });
            screen.getByText('notes.txt is not an accepted file type');
            screen.getByText(/^big\.pdf is larger than 10 B$/);
            (published.value as unknown[]).length.should.equal(0);
        });

        it('should refuse a second file when only one is allowed', () => {
            const { input } = mount(undefined, { multiple: false });
            fireEvent.change(input, { target: { files: [pdf('a.pdf'), pdf('b.pdf')] } });
            screen.getByText('Only one file can be uploaded at a time');
            screen.getAllByRole('listitem').length.should.equal(1);
        });

        it('should send the files through the handler and mark them done, or failed with a retry', async () => {
            let attempts = 0;
            const { input } = mount(async () => { attempts++; if (attempts === 1) throw new Error('no'); }, { serverUrl: '/uploads' });
            fireEvent.change(input, { target: { files: [pdf('a.pdf')] } });
            await screen.findByText('Upload failed');
            fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
            await screen.findByText('Uploaded');
            attempts.should.equal(2);
        });

        it('should accept a drop the way it accepts a choice, and remove a file from the list', () => {
            const { container, published } = mount();
            fireEvent.drop(container.querySelector('.foundation-dropzone')!, { dataTransfer: { files: [pdf('dropped.pdf')] } });
            screen.getByText('dropped.pdf');
            fireEvent.click(screen.getByRole('button', { name: 'Remove dropped.pdf' }));
            (published.value as unknown[]).length.should.equal(0);
        });

        it('should ignore a drop when the permission rule is not enabled', () => {
            const { container } = mount(undefined, { actionPermission: 'disabled' });
            fireEvent.drop(container.querySelector('.foundation-dropzone')!, { dataTransfer: { files: [pdf('dropped.pdf')] } });
            (screen.queryByText('dropped.pdf') === null).should.equal(true);
            (input_(container).disabled).should.equal(true);
        });

        it('should leave the uploader with a selection and a refusal without accessibility violations', async () => {
            const { container, input } = mount();
            fireEvent.change(input, { target: { files: [pdf('a.pdf'), new File(['x'], 'b.txt', { type: 'text/plain' })] } });
            (await violationsIn(container)).should.deep.equal([]);
        });
    });

    describe('and following an approval chain', () => {
        const chain = (steps: unknown[]) => render(<ApprovalChainStepper element={foundationElement(ComponentName.ApprovalChainStepper, { steps })} slots={{}} />);

        it('should say the state of every step in words and mark the current one', () => {
            const { container } = chain([{ label: 'Lead', state: 'approved' }, { label: 'Finance' }, { label: 'Director' }]);
            Array.from(container.querySelectorAll('.foundation-approval-step')).map(step => step.getAttribute('data-state')).should.deep.equal(['approved', 'current', 'pending']);
            container.querySelector('[aria-current="step"]')!.textContent!.should.contain('Finance');
            container.querySelector('[aria-current="step"]')!.textContent!.should.contain('Awaiting decision');
            screen.getByText('Waiting for a decision');
        });

        it('should stop at a rejection and say the rest were not reached', () => {
            const { container } = chain([{ label: 'Lead', state: 'rejected' }, { label: 'Finance' }]);
            screen.getByText('Rejected', { selector: '.foundation-approval-outcome' });
            container.querySelectorAll('.foundation-approval-step')[1].textContent!.should.contain('Not reached');
            (container.querySelector('[aria-current="step"]') === null).should.equal(true);
        });

        it('should number each step for assistive technology', () => {
            const { container } = chain([{ label: 'Lead' }, { label: 'Finance' }]);
            container.querySelectorAll('.foundation-approval-step')[1].textContent!.should.contain('Step 2 of 2');
        });
    });

    describe('and walking an org tree', () => {
        const mount = (properties?: Record<string, unknown>) => {
            const { published, bindingOutputs } = outputs();
            const view = render(<OrgTree element={foundationElement(ComponentName.OrgTree, { ...foundationSamples[ComponentName.OrgTree].properties, ...properties })} slots={{}} bindingOutputs={bindingOutputs} />);
            return { published, ...view };
        };
        const item = (name: string) => screen.getByRole('treeitem', { name: new RegExp(name) });

        it('should open the first levels and describe each item for assistive technology', () => {
            mount();
            screen.getAllByRole('treeitem').length.should.equal(3);
            item('Ada Lovelace').getAttribute('aria-level')!.should.equal('1');
            item('Ada Lovelace').getAttribute('aria-expanded')!.should.equal('true');
            item('Grace Hopper').getAttribute('aria-expanded')!.should.equal('false');
            item('Grace Hopper').getAttribute('aria-setsize')!.should.equal('2');
            item('Linus Torvalds').getAttribute('aria-posinset')!.should.equal('2');
            item('Ada Lovelace').textContent!.should.contain('3 reports');
        });

        it('should have one tab stop', () => {
            mount();
            screen.getAllByRole('treeitem').filter(node => node.getAttribute('tabindex') === '0').length.should.equal(1);
        });

        it('should expand and collapse with the arrow keys', () => {
            mount();
            fireEvent.keyDown(item('Grace Hopper'), { key: 'ArrowRight' });
            screen.getAllByRole('treeitem').length.should.equal(4);
            fireEvent.keyDown(item('Grace Hopper'), { key: 'ArrowLeft' });
            screen.getAllByRole('treeitem').length.should.equal(3);
        });

        it('should select with enter and publish the id', () => {
            const { published } = mount();
            fireEvent.keyDown(item('Linus Torvalds'), { key: 'Enter' });
            (published.value as string).should.equal('cfo');
            item('Linus Torvalds').getAttribute('aria-selected')!.should.equal('true');
        });

        it('should say there is nobody when it has no rows', () => {
            const { container } = mount({ nodes: [] });
            container.querySelector('.foundation-empty-headline')!.textContent!.should.equal('There is nobody in the organization yet');
        });

        it('should leave the tree without accessibility violations', async () => {
            const { container } = mount();
            fireEvent.keyDown(item('Grace Hopper'), { key: 'ArrowRight' });
            (await violationsIn(container)).should.deep.equal([]);
        });
    });

    describe('and editing a permission matrix', () => {
        const mount = (properties?: Record<string, unknown>) => {
            const { published, bindingOutputs } = outputs();
            const view = render(<PermissionMatrix element={foundationElement(ComponentName.PermissionMatrix, { ...foundationSamples[ComponentName.PermissionMatrix].properties, editPermission: 'enabled', ...properties })} slots={{}} bindingOutputs={bindingOutputs} />);
            return { published, ...view };
        };

        it('should name each box by its permission and role, and announce row and column through real headers', () => {
            const { container } = mount();
            (screen.getByLabelText('Grant Edit deals to Sales') as HTMLInputElement).checked.should.equal(false);
            (screen.getByLabelText('Grant Edit deals to Administrator') as HTMLInputElement).checked.should.equal(true);
            container.querySelectorAll('thead th[scope="col"]').length.should.equal(3);
            container.querySelectorAll('tbody th[scope="row"]').length.should.equal(3);
            container.querySelectorAll('th[scope="colgroup"]').length.should.equal(2);
        });

        it('should publish a change as grants and keep the others', () => {
            const { published } = mount();
            fireEvent.click(screen.getByLabelText('Grant Edit deals to Sales'));
            (published.value as unknown[]).length.should.equal(5);
            fireEvent.click(screen.getByLabelText('Grant View deals to Sales'));
            (published.value as unknown[]).length.should.equal(4);
        });

        it('should be read-only without the edit permission and say allowed or not allowed in words', () => {
            const { container } = mount({ editPermission: 'disabled' });
            container.querySelectorAll('input').length.should.equal(0);
            container.querySelectorAll('td')[0].textContent!.should.equal('Allowed');
            container.querySelectorAll('td')[3].textContent!.should.equal('Not allowed');
        });

        it('should scroll in a labelled, keyboard-focusable region', () => {
            const { container } = mount();
            const region = container.querySelector('.foundation-matrix-scroll')!;
            region.getAttribute('tabindex')!.should.equal('0');
            region.getAttribute('aria-label')!.should.equal('Permission matrix, scrolls sideways');
        });

        it('should leave the matrix without accessibility violations, editable and read-only', async () => {
            const editable = mount();
            (await violationsIn(editable.container)).should.deep.equal([]);
            cleanup();
            const readOnly = mount({ editPermission: 'disabled' });
            (await violationsIn(readOnly.container)).should.deep.equal([]);
        });
    });
});

const input_ = (container: HTMLElement) => container.querySelector('input[type="file"]') as HTMLInputElement;
