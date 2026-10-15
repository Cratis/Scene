// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import sinon from 'sinon';
import { afterEach } from 'vitest';
import { ChartWrapper, ColumnChooser, FilterBuilder, SavedViewsMenu, foundationElement, foundationSamples } from '../foundation';
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
});
