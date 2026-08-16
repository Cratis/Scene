// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { clearBindings, registerCommands, registerQueries } from '@cratis/scene.components';
import { SampleBindingName } from '../templates';
import { GalleryScreenPreview, GalleryScreenPreviewProps } from './GalleryScreenPreview';

/**
 * The two states every Arc-bound page has, side by side.
 *
 * A template carries a query or command *name*; a host owns the generated Arc proxies and registers a
 * class under each name. Which of those two has happened is the single biggest difference between what a
 * designer sees and what a user sees, so it is worth being able to look at both.
 */

/**
 * The fakes a host would supply real proxies for.
 *
 * A registered class needs nothing but to be constructible - `BoundConstructor` is deliberately the widest
 * honest shape, because Scene does not depend on Arc and has no way to check that a class really is a
 * query. Whether it is is the host's responsibility, checked where the host registers it with the real Arc
 * types in scope.
 */
class AllInvoices {}
class InvoicesInFlight {}
class InvoiceById {}
class RevenueByMonth {}
class OpenTickets {}
class AllAdjustments {}
class RegisterInvoice {}
class RecordAdjustment {}

const queries = {
    [SampleBindingName.AllInvoices]: AllInvoices,
    [SampleBindingName.InvoicesInFlight]: InvoicesInFlight,
    [SampleBindingName.InvoiceById]: InvoiceById,
    [SampleBindingName.RevenueByMonth]: RevenueByMonth,
    [SampleBindingName.OpenTickets]: OpenTickets,
    [SampleBindingName.AllAdjustments]: AllAdjustments,
};

const commands = {
    [SampleBindingName.RegisterInvoice]: RegisterInvoice,
    [SampleBindingName.RecordAdjustment]: RecordAdjustment,
};

/**
 * Renders a gallery screen with every binding this blueprint's templates name registered against a fake.
 *
 * Registration happens in a `useMemo` so it runs before the tree below it renders - an effect would run
 * after, and the first paint would show the unbound state.
 *
 * What registering changes here is worth being precise about. Every page header stops asking for a name
 * and reports the binding as resolved, and the Arc-free composites - the schema editor, the document
 * editor, the navigational bar, the time machine - render their real content either way. What it cannot
 * do in a Storybook is put *rows* in a table: `@cratis/arc` is a peer dependency the host supplies, and a
 * design surface is not a host, so a resolved data table loads its chunk and shows the library's own error
 * boundary rather than data. That is the same thing an application without the Arc client installed sees,
 * and hiding it would be inventing a state that does not exist.
 */
function BoundScreen({ screenName, initialConfig }: GalleryScreenPreviewProps) {
    useMemo(() => {
        clearBindings();
        registerQueries(queries);
        registerCommands(commands);
    }, []);

    return <GalleryScreenPreview screenName={screenName} initialConfig={initialConfig} />;
}

/** Renders a gallery screen with nothing registered - the normal design-time state. */
function UnboundScreen({ screenName, initialConfig }: GalleryScreenPreviewProps) {
    useMemo(() => clearBindings(), []);
    return <GalleryScreenPreview screenName={screenName} initialConfig={initialConfig} />;
}

const meta = {
    title: 'Blueprint/Bindings',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'What the binding registry does to a page. A template names a query or a command; a host registers the generated Arc ' +
                    'proxy under that name. These stories show a page with nothing registered, and the same pages with small fakes ' +
                    'registered, so the difference is something you can look at rather than something you have to take on trust.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Nothing registered: every Arc-bound region is a placeholder naming the binding it wanted, and the header
 * says which query a host still has to wire. One unbound table costs one dashed box, not the page.
 */
export const Unbound: Story = {
    args: { screenName: 'DataListPage' },
    render: args => <UnboundScreen {...args} />,
};

/**
 * The same page with fakes registered: the placeholders are gone, because the names now resolve to
 * classes. The table beyond them needs an Arc client, which a design surface does not have.
 */
export const Bound: Story = {
    args: { screenName: 'DataListPage' },
    render: args => <BoundScreen {...args} />,
};

/**
 * A page that renders with real data in both states, because nothing on it is Arc-bound.
 *
 * The document editor, the navigational bar and the time machine all take their content from the property
 * bag. Only the header changes when the binding is registered - from asking for `InvoiceById` to reporting
 * it as resolved - which is exactly the seam this package's one registered component exists to show.
 */
export const BoundWithRealContent: Story = {
    args: { screenName: 'ObjectEditorPage' },
    render: args => <BoundScreen {...args} />,
};

/** The same page unbound, for the comparison. */
export const UnboundWithRealContent: Story = {
    args: { screenName: 'ObjectEditorPage' },
    render: args => <UnboundScreen {...args} />,
};
