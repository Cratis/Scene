// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { foldDesignSession, type DesignMode, type DesignSessionEvent, type DesignSubject } from '@cratis/scene.design';
import { DesignCanvas } from '../Canvas/DesignCanvas';
import { ScreensOverview } from '../Overview/ScreensOverview';
import type { OverviewSubject } from '../Overview/screensOverview';
import { askTheFakeAI } from '../Testing/askTheFakeAI';
import { createFakeDesignHost, type FakeDesignHost } from '../Testing/createFakeDesignHost';

const started = (mode: DesignMode = 'screens', subject: DesignSubject = { kind: 'story', id: 'story-1' }): DesignSessionEvent =>
    ({ type: 'DesignSessionStarted', sessionId: 'session-1', subject, mode, startedBy: 'ada' });

/**
 * The canvas against a fake host: an in-memory session, a stand-in for the Screenplay bridge and a scripted AI that performs its turns through the
 * real design engine. Try in the chat bar: "add a screen called Invoices", "show me other layouts", "give me some tweaks", "make it neon pink"
 * (refused, with alternatives), "please fail".
 */
const meta: Meta<typeof DesignCanvas> = {
    title: 'Design/Canvas',
    component: DesignCanvas,
    parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof DesignCanvas>;

/** A fake host that has been through some scripted turns; the canvas is drawn once they are done. */
function useSeededHost(options: { mode?: DesignMode; subject?: DesignSubject; stepMs?: number }, ...prompts: string[]): FakeDesignHost | undefined {
    const fake = useMemo(() => createFakeDesignHost({
        events: [started(options.mode, options.subject)], stepMs: options.stepMs ?? 0, ...(options.subject === undefined ? {} : { subject: options.subject }),
    }), [options.mode, options.subject, options.stepMs]);
    const [ready, setReady] = useState(prompts.length === 0);
    useEffect(() => {
        let alive = true;
        void prompts.reduce((chain, prompt) => chain.then(() => askTheFakeAI(fake, prompt).then(() => undefined)), Promise.resolve()).then(() => { if (alive) setReady(true); });
        return () => { alive = false; };
        // The prompts are fixed by the story that asks them.
    }, [fake]);
    return ready ? fake : undefined;
}

const Seeded = ({ prompts, mode, subject }: { prompts: string[]; mode?: DesignMode; subject?: DesignSubject }) => {
    const fake = useSeededHost({ ...(mode === undefined ? {} : { mode }), ...(subject === undefined ? {} : { subject }) }, ...prompts);
    return fake === undefined ? null : <DesignCanvas host={fake.host} {...(mode === undefined ? {} : { mode })} />;
};

/** A subject with no design yet: the canvas starts the session by itself. */
export const Empty: Story = {
    render: () => {
        const fake = useMemo(() => createFakeDesignHost({ stepMs: 600 }), []);
        return <DesignCanvas host={fake.host} />;
    },
};

/** An empty session whose scripted AI takes a moment on each step, so a turn in flight - its status, the cancel button - can be seen. */
export const AskTheChat: Story = {
    render: () => {
        const fake = useMemo(() => createFakeDesignHost({ events: [started()], stepMs: 700 }), []);
        return <DesignCanvas host={fake.host} />;
    },
};

/** Screens along the default storyline, reorderable with the arrows above each artboard; each has a history, and can be commented on and edited. */
export const WithScreens: Story = {
    render: () => <Seeded prompts={['Add a screen called InvoiceList', 'Add a screen called InvoiceDetails', 'Add a screen called PayInvoice']} />,
};

/** A screen with tweak controls offered: a corners choice and an accent hue, each applying a deterministic edit that is its own revision. */
export const WithTweaks: Story = {
    render: () => <Seeded prompts={['Add a screen called Home', 'Give me some tweaks']} />,
};

/** A screen with other layouts offered side by side: choosing one makes it the next revision. */
export const WithVariations: Story = {
    render: () => <Seeded prompts={['Add a screen called Orders', 'Show me other layouts']} />,
};

/** In template mode the canvas designs the design system's screen templates: slots and outlets are drawn, and a template is proposed to the draft. */
export const TemplateMode: Story = {
    render: () => {
        const fake = useMemo(() => createFakeDesignHost({ events: [started('templates')] }), []);
        return <DesignCanvas host={fake.host} mode='templates' />;
    },
};

/** Another subject kind: the canvas is mounted per subject, so the same one serves an issue. */
export const ForAnIssue: Story = {
    render: () => <Seeded subject={{ kind: 'issue', id: 'issue-42' }} prompts={['Add a screen called OverdueBanner']} />,
};

/** A host that offers no AI: the chat bar is off and the canvas edits by hand. */
export const WithoutAI: Story = {
    render: () => {
        const fake = useMemo(() => createFakeDesignHost({ events: [started()], ai: false }), []);
        return <DesignCanvas host={fake.host} />;
    },
};

/** The read-only screens overview a product-wide "Screens" tab shows: every subject's screens, each linking back to its subject. */
export const Overview: StoryObj<typeof ScreensOverview> = {
    render: () => {
        const [subjects, setSubjects] = useState<OverviewSubject[]>([]);
        const host = useMemo(() => createFakeDesignHost(), []);
        useEffect(() => {
            let alive = true;
            const load = async (subject: DesignSubject, title: string, ...prompts: string[]): Promise<OverviewSubject> => {
                const fake = createFakeDesignHost({ events: [started('screens', subject)], subject });
                for (const prompt of prompts) await askTheFakeAI(fake, prompt);
                const session = foldDesignSession(fake.store.getEvents())!;
                const screens = await Promise.all(session.screens.map(async entry => ({
                    name: entry.screen,
                    document: await fake.host.screenplay.toDocument([{ screen: entry.screen, text: session.revisions.find(revision => revision.id === entry.currentRevision)!.text }], 'screens'),
                })));
                return { subject, title, screens };
            };
            void Promise.all([
                load({ kind: 'story', id: 's1' }, 'Pay an invoice', 'Add a screen called InvoiceList', 'Add a screen called PayInvoice'),
                load({ kind: 'issue', id: 'i7' }, 'Overdue banner', 'Add a screen called Banner'),
            ]).then(loaded => { if (alive) setSubjects(loaded); });
            return () => { alive = false; };
        }, []);
        return <ScreensOverview subjects={subjects} runtime={host.runtime} routing={{ openSubject: (subject, name) => console.info('open', subject, name) }} />;
    },
};
