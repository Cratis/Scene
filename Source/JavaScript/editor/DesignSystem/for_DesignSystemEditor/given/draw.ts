// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DesignSystemEditor } from '../../DesignSystemEditor';
import type { DesignSystemView } from '../../Browsing/designSystemView';
import type { DesignSystemHost, DesignSystemState } from '../../DesignSystemHost';
import { createFakeDesignSystemHost, type FakeDesignSystemHost, type FakeDesignSystemHostOptions } from '../../Testing/createFakeDesignSystemHost';

/** An editor drawn against a fake host. */
export interface DrawnEditor {
    /** The host. */
    host: FakeDesignSystemHost;

    /** The state the editor was drawn with. */
    state: DesignSystemState;

    /** What was drawn. */
    markup: string;
}

/**
 * Draws the editor to markup against a fake host, with the state the host holds (after `prepare` has had its way with the host).
 *
 * @param view Where the editor is looking.
 * @param options What the host is built from.
 * @param prepare Does something to the host first - starts a draft, say.
 * @param extend Adds to the host.
 * @returns What was drawn.
 */
export const drawEditor = async (
    view: DesignSystemView = {},
    options: FakeDesignSystemHostOptions = {},
    prepare: (host: FakeDesignSystemHost) => Promise<void> = async () => {},
    extend: (host: FakeDesignSystemHost) => DesignSystemHost = host => host
): Promise<DrawnEditor> => {
    const host = createFakeDesignSystemHost(options);
    await prepare(host);
    const state = await host.load();
    const markup = renderToStaticMarkup(createElement(DesignSystemEditor, { host: extend(host), initialState: state, view, subject: 'Acme' }));
    return { host, state, markup };
};
