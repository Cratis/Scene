// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { expect, fireEvent, within } from 'storybook/test';
import { ExternalComponent, HorizontalAlignment, Theme, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { SceneElementView, SceneThemeProvider } from '@cratis/scene.react';
import { cratisComponents } from './cratisComponents';

/**
 * Builds the `ExternalComponent` a screen compiles to, with the inherited layout properties at their
 * neutral values. Stories are about `properties` and `slots`; everything else is noise, so it lives here.
 */
function component(id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, ExternalComponent[]> = {}): ExternalComponent {
    return {
        id,
        name: id,
        componentName,
        properties,
        slots,
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
    };
}

const toolbar = component('toolbar', 'Cratis.Components:toolbar', { orientation: 'horizontal' }, {
    content: [
        component('new', 'Cratis.Components:toolbarButton', { icon: 'pi pi-plus', title: 'New invoice' }),
        component('refresh', 'Cratis.Components:toolbarButton', { icon: 'pi pi-refresh', title: 'Refresh' }),
        component('separator', 'Cratis.Components:toolbarSeparator', { orientation: 'horizontal' }),
        component('group', 'Cratis.Components:toolbarGroup', { orientation: 'horizontal' }, {
            content: [
                component('approve', 'Cratis.Components:toolbarButton', { icon: 'pi pi-check', title: 'Approve', active: true }),
                component('reject', 'Cratis.Components:toolbarButton', { icon: 'pi pi-times', title: 'Reject' }),
            ],
        }),
    ],
});

const statusDropdown = component('status', 'Cratis.Components:dropdown', {
    placeholder: 'Any status',
    showClear: true,
    options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Approved', value: 'approved' },
        { label: 'Paid', value: 'paid' },
    ],
});

const invoicesTable = component('invoices', 'Cratis.Components:dataTable', {
    query: 'AllInvoices',
    emptyMessage: 'No invoices yet',
    dataKey: 'invoiceId',
});

const invoicesScreen = component('page', 'Cratis.Components:page', { title: 'Invoices', showTitle: true, panel: true }, {
    content: [toolbar, statusDropdown, invoicesTable],
});

const meta = {
    title: 'Packages/Cratis Components',
    component: SceneElementView,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'The `Cratis.Components` Scene package: `@cratis/components` exposed as resolvable Scene components. ' +
                    'Every story renders a real `ExternalComponent` tree through the real `SceneElementView` and the real ' +
                    'component registry, so what is shown is exactly what a `.play` screen resolves to.',
            },
        },
    },
    args: {
        registry: cratisComponents,
        resolveBinding: () => undefined,
    },
} satisfies Meta<typeof SceneElementView>;

export default meta;

type Story = StoryObj<typeof meta>;

/** An invoices screen: page chrome, a toolbar, a filter dropdown, and a table waiting on its query. */
export const Playground: Story = {
    args: { element: invoicesScreen },
};

/**
 * What design-time preview normally looks like. Nothing is registered in the binding registry, so every
 * Arc-bound component names the binding it wanted instead of rendering blank or throwing - and the rest
 * of the screen is entirely usable while that is true.
 */
export const MissingBindings: Story = {
    args: {
        element: component('unbound', 'Cratis.Components:page', { title: 'Unbound', showTitle: true }, {
            content: [
                component('table', 'Cratis.Components:dataTable', { query: 'AllInvoices', emptyMessage: 'None' }),
                component('live', 'Cratis.Components:observableDataTable', { query: 'InvoicesInFlight', emptyMessage: 'None' }),
                component('form', 'Cratis.Components:commandForm', { command: 'RegisterInvoice' }),
                component('nameless', 'Cratis.Components:dataPage', { title: 'No query named' }),
                component('field', 'Cratis.Components:inputTextField', { title: 'No property named' }),
            ],
        }),
    },
};

/** The toolbar family - buttons, a group and a separator - inside its own container. */
export const Toolbar: Story = {
    args: {
        element: component('page', 'Cratis.Components:page', { title: 'Toolbar', showTitle: true }, { content: [toolbar] }),
    },
};

/** The editors: a schema editor, a breadcrumb trail and a document editor, all Arc-free. */
export const Editors: Story = {
    args: {
        element: component('page', 'Cratis.Components:page', { title: 'Editors', showTitle: true }, {
            content: [
                component('trail', 'Cratis.Components:objectNavigationalBar', { navigationPath: ['shipping', 'address'] }),
                component('schema', 'Cratis.Components:schemaEditor', {
                    eventTypeName: 'InvoiceRegistered',
                    canEdit: true,
                    schema: {
                        title: 'InvoiceRegistered',
                        type: 'object',
                        properties: {
                            number: { type: 'string' },
                            amount: { type: 'number' },
                            issued: { type: 'string', format: 'date-time' },
                        },
                    },
                }),
                component('document', 'Cratis.Components:objectContentEditor', {
                    editMode: true,
                    object: { number: 'INV-1001', amount: 4200 },
                    schema: { type: 'object', properties: { number: { type: 'string' }, amount: { type: 'number' } } },
                }),
            ],
        }),
    },
};

/** The tooltip, icon and error boundary wrappers, in a small composition. */
export const InContext: Story = {
    args: {
        element: component('page', 'Cratis.Components:page', { title: 'Invoice INV-1001', showTitle: true, panel: true }, {
            content: [
                component('guard', 'Cratis.Components:errorBoundary', {}, {
                    content: [
                        component('hint', 'Cratis.Components:tooltip', { content: 'Approved on 5 January', position: 'right' }, {
                            content: [component('icon', 'Cratis.Components:icon', { icon: 'pi pi-check-circle' })],
                        }),
                        component('filters', 'Cratis.Components:filterPanel', {
                            label: 'Filters',
                            filters: [
                                {
                                    key: 'status',
                                    label: 'Status',
                                    multi: true,
                                    options: [
                                        { key: 'draft', label: 'Draft', count: 12 },
                                        { key: 'approved', label: 'Approved', count: 44 },
                                    ],
                                },
                            ],
                        }),
                    ],
                }),
            ],
        }),
    },
};

/**
 * A Scene theme driving `@cratis/components` through the token bridge.
 *
 * Neither side knows about the other: the theme carries semantic Scene tokens, `SceneThemeProvider`
 * writes them as `--scene-*` custom properties, and this package's stylesheet maps those onto the
 * `--cratis-*` names the library reads. Nothing in `@cratis/components` was changed to make this work.
 */
const midnight: Theme = {
    name: 'Midnight',
    compatibleWith: ['Cratis.Components', 'PrimeReact', 'Tailwind'],
    isDark: true,
    description: 'A dark Scene theme, applied to Cratis Components entirely through design tokens.',
    tokens: {
        'primary.color': '#a78bfa',
        'primary.contrastColor': '#1e1b4b',
        'surface.background': '#0f172a',
        'surface.card': '#1e293b',
        'surface.border': '#334155',
        'surface.hover': '#273449',
        'surface.overlay': '#1e293b',
        'text.color': '#e2e8f0',
        'text.mutedColor': '#94a3b8',
        'highlight.background': '#312e81',
        'highlight.color': '#e0e7ff',
        'content.borderRadius': '10px',
        'focus.ring': '0 0 0 0.2rem #4c1d95',
    },
};

export const Themed: Story = {
    args: { element: invoicesScreen },
    render: args => (
        <SceneThemeProvider theme={midnight}>
            <SceneElementView {...args} />
        </SceneThemeProvider>
    ),
};

/**
 * The breadcrumb trail is stateful: clicking a crumb truncates the path, which the underlying component
 * reports and the adapter applies.
 */
export const Interactive: Story = {
    args: {
        element: component('trail', 'Cratis.Components:objectNavigationalBar', { navigationPath: ['shipping', 'address', 'street'] }),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        fireEvent.click(canvas.getByText('address'));
        await expect(canvas.queryByText('street')).toBeNull();
    },
};
