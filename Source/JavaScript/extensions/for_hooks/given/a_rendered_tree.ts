// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement, ReactElement } from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { createExtensionContext, ExtensionContextController, ExtensionContextProvider } from '../../index';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Renders a tree under an extension context and cleans it up afterwards. */
export class a_rendered_tree {
    readonly host = document.createElement('div');
    readonly controller: ExtensionContextController;
    private root: Root | undefined;

    constructor(controller: ExtensionContextController = createExtensionContext()) {
        this.controller = controller;
        document.body.appendChild(this.host);
    }

    async render(...children: ReactElement[]): Promise<void> {
        this.root ??= createRoot(this.host);
        await act(async () => {
            this.root!.render(createElement(ExtensionContextProvider, { context: this.controller.context }, ...children));
        });
    }

    async change(action: () => void): Promise<void> {
        await act(async () => { action(); });
    }

    async dispose(): Promise<void> {
        await act(async () => { this.root?.unmount(); });
        this.host.remove();
    }
}
