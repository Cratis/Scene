// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    InteractionActionKind,
    InteractionTriggerKind,
    type Behavior,
    type BuiltInInteractionTrigger,
    type ExecuteCommandAction,
    type InteractionAction,
    type NavigateAction,
    type OpenDialogAction,
} from '@cratis/scene.model';
import { ToolbarButtonClickKind } from './ToolbarButtonClickKind';

// What a toolbar button does when pressed, and what it does it to: a screen, a dialog template, or a slice.
export interface ToolbarButtonClick {
    kind: ToolbarButtonClickKind;
    target: string;
}

// The behavior the editor owns on a toolbar button. Any other behavior the button carries - authored elsewhere, or
// imported - is left exactly as it is.
export const toolbarButtonClickBehavior = 'studio.toolbarButton.click';

const noClick: ToolbarButtonClick = { kind: ToolbarButtonClickKind.None, target: '' };

export function readToolbarButtonClick(behaviors: readonly Behavior[] | undefined): ToolbarButtonClick {
    const behavior = behaviors?.find(candidate => candidate.name === toolbarButtonClickBehavior);
    const action = behavior?.bindings.find(binding => isClick(binding.trigger))?.actions[0];
    return action ? clickOf(action) : noClick;
}

// The button's behaviors with its click replaced. A click to nothing removes the editor's behavior; a button left
// with no behaviors at all has none, rather than an empty list.
export function withToolbarButtonClick(behaviors: readonly Behavior[] | undefined, click: ToolbarButtonClick): Behavior[] | undefined {
    const others = (behaviors ?? []).filter(candidate => candidate.name !== toolbarButtonClickBehavior);
    const action = actionOf(click);
    const next = action
        ? [...others, { name: toolbarButtonClickBehavior, bindings: [{ trigger: { kind: InteractionTriggerKind.Click } as BuiltInInteractionTrigger, actions: [action] }] }]
        : others;
    return next.length > 0 ? next : undefined;
}

function actionOf(click: ToolbarButtonClick): InteractionAction | undefined {
    if (click.target === '') return undefined;
    switch (click.kind) {
        case ToolbarButtonClickKind.Navigate: return { kind: InteractionActionKind.Navigate, screen: click.target } as NavigateAction;
        case ToolbarButtonClickKind.OpenDialog: return { kind: InteractionActionKind.OpenDialog, dialogTemplate: click.target } as OpenDialogAction;
        case ToolbarButtonClickKind.ExecuteCommand: return { kind: InteractionActionKind.ExecuteCommand, command: click.target } as ExecuteCommandAction;
        case ToolbarButtonClickKind.None: return undefined;
    }
}

function clickOf(action: InteractionAction): ToolbarButtonClick {
    switch (action.kind) {
        case InteractionActionKind.Navigate: return { kind: ToolbarButtonClickKind.Navigate, target: (action as NavigateAction).screen };
        case InteractionActionKind.OpenDialog: return { kind: ToolbarButtonClickKind.OpenDialog, target: (action as OpenDialogAction).dialogTemplate };
        case InteractionActionKind.ExecuteCommand: return { kind: ToolbarButtonClickKind.ExecuteCommand, target: (action as ExecuteCommandAction).command };
        default: return noClick;
    }
}

function isClick(trigger: unknown): boolean {
    return (trigger as BuiltInInteractionTrigger | undefined)?.kind === InteractionTriggerKind.Click;
}
