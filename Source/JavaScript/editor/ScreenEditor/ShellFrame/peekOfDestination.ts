// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, type DestinationReference, type SceneElement } from '@cratis/scene.model';
import { externalComponent } from '@cratis/scene.blueprint.default';

// What a destination is called while it is peeked at from the shell around the screen being edited: the screen or dialog it names.
export function peekNameOf(destination: DestinationReference): string {
    return destination.screen ?? destination.slice ?? destination.dialog ?? '';
}

// Whether the shell's navigation can be followed to this destination. External links and dialogs open nowhere in the editor.
export function canPeek(destination: DestinationReference): boolean {
    return destination.kind !== DestinationKind.External && destination.dialog === undefined && peekNameOf(destination) !== '';
}

// The stand-in for another screen in the content slot. The editor holds the one screen it edits; the others are edited where they live, so
// the peek shows the shell as it is on that screen - the entry current, the trail following - with the slot saying whose it is.
export function peekElement(destination: DestinationReference, text: string): SceneElement {
    return externalComponent('studio-shell-peek', 'text', { text: text.replace('{name}', peekNameOf(destination)) });
}
