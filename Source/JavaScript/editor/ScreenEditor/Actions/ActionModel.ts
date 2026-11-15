// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Opens, OutletSubject } from '@cratis/scene.model';

// A row or toolbar action as an author edits it: which slice it submits, what feeds each input, and where its slice opens (Scene 5 `opens`).
export interface ActionModel {
    sliceId: string;

    // The slice's name, shown to the author; the command is addressed by `sliceId`.
    sliceName: string;

    // Each command input and the binding path that feeds it; an input missing here is left for the form.
    inputs: Record<string, string>;
    opens: Opens;

    // The slot of the page the slice opens in, when it opens in a slot.
    opensIn?: string;

    // What the action acts on and the condition that enables it (StudioIssues#1331), as a button of an outlet has them. Not saying is the screen, and always.
    subject?: OutletSubject;
    enabledWhen?: string;
}
