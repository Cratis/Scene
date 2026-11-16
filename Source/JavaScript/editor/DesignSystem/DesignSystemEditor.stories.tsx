// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, useState } from 'react';
import type { DesignSystemView } from './Browsing/designSystemView';
import type { Meta, StoryObj } from '@storybook/react';
import type { DesignSystemConflictEntry } from './Conflicts/DesignSystemConflict';
import { DesignSystemEditor } from './DesignSystemEditor';
import type { DesignSystemPreview } from './Previewing/DesignSystemPreview';
import type { OffStandardScreen } from './Standard/offStandardEntries';
import { createFakeDesignSystemHost, type FakeDesignSystemHostOptions } from './Testing/createFakeDesignSystemHost';

interface StoryProps {
    /** What the fake host is built from. */
    host: FakeDesignSystemHostOptions;

    /** The section the editor opens on. */
    section?: string;
}

/**
 * The design system editor against a fake host: a design system kept in memory, so a draft really changes as it is edited by hand
 * and every action - starting, saving, discarding, submitting and activating a draft, deciding conflicts, fixing what is off the
 * standard - does what a host's would. Nothing is sent anywhere.
 */
const Editor = ({ host: options, section }: StoryProps) => {
    const host = useMemo(() => createFakeDesignSystemHost(options), [options]);
    const [view, setView] = useState<DesignSystemView>({ section, version: options.draft ? 'draft' : undefined });
    return <DesignSystemEditor host={host} subject='Acme' view={view} onViewChange={setView} />;
};

const meta = {
    title: 'Editor/Design system',
    component: Editor,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The design system editor, run against a fake host. The editor shows a design system and edits it by address; ' +
                    'everything that leaves it - reading versions, saving a change, starting, discarding, submitting and activating ' +
                    'a draft, conflicts, what is off the standard, drawing screens - goes through the host it is given.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Editor>;

export default meta;

type Story = StoryObj<typeof meta>;

const conflicts: DesignSystemConflictEntry[] = [
    {
        version: 2,
        chosen: '',
        decidedBy: '',
        issueRaised: false,
        conflict: {
            id: 'border-grey',
            kind: 'color',
            title: 'Two greys for borders',
            options: [
                { value: '#cbd5e1', count: 12, places: [{ source: 'repo: src/index.css', count: 7 }, { source: 'repo: tailwind.config.js', count: 5 }] },
                { value: '#cdd6e2', count: 2, places: [{ source: 'repo: src/legacy.css', count: 2 }] },
            ],
        },
    },
    {
        version: 2,
        chosen: '6px',
        decidedBy: 'ada',
        issueRaised: false,
        conflict: {
            id: 'corner',
            kind: 'corner',
            title: 'Corner radius of cards',
            options: [{ value: '6px', count: 9, places: [] }, { value: '8px', count: 3, places: [{ source: 'repo: src/cards.css', count: 3 }] }],
        },
    },
];

const offStandard: OffStandardScreen[] = [
    { id: 'orders', title: 'Orders', values: [{ kind: 'color', value: '#123456', suggestion: '--color-primary', count: 3 }, { kind: 'component', value: 'Chip', suggestion: '', count: 1 }] },
    { id: 'invoices', title: 'Invoices', values: [{ kind: 'color', value: '#123456', suggestion: '--color-primary', count: 2 }] },
];

const preview: DesignSystemPreview = {
    different: 1,
    broken: 1,
    problem: '',
    screens: [
        { screen: 'layout:AppShell', name: 'AppShell', different: true, broken: false, problems: [], images: [] },
        { screen: 'screen:Workspaces.Sheet', name: 'Workspaces.Sheet', different: false, broken: true, problems: ['Text on the card reads 2.1:1 in dark mode'], images: [] },
    ],
};

/** The active version, read-only: browse the foundations, themes, components and words. */
export const Active: Story = { args: { host: {} } };

/** The active version with what is off the standard found by the host. */
export const OffTheStandard: Story = { args: { host: { standard: offStandard }, section: 'standard' } };

/** A draft is open: values, parts, words and themes are changed in place, and each change is made to the in-memory design system. */
export const Draft: Story = { args: { host: { draft: true }, section: 'color' } };

/** The changes of a draft with conflicts to decide and a preview the host can draw. */
export const ReviewingADraft: Story = { args: { host: { draft: true, conflicts, preview }, section: 'changes' } };

/** The host cannot draw screens right now. */
export const PreviewUnavailable: Story = { args: { host: { draft: true, preview, previewAvailable: false }, section: 'changes' } };

/** A host that refuses every change, to show how the editor takes a refusal. */
export const HostRefuses: Story = { args: { host: { draft: true, refuse: 'Drafts are frozen while a release is cut.' }, section: 'words' } };

/** A product with no design system yet: the editor offers the starter. */
export const NoDesignSystem: Story = { args: { host: { state: { history: [] } } } };
