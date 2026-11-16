// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignCanvasStrings, DesignStringKey } from './DesignCanvasHost';

/** The words the canvas shows when its host does not bring its own. American English. */
export const defaultDesignStrings: Record<DesignStringKey, string> = {
    chatPlaceholder: 'Describe what to design or change',
    send: 'Send',
    cancel: 'Cancel',
    working: 'Working on it',
    refused: 'Part of that is not allowed in this design system',
    failed: 'The design turn failed',
    proposeToSystem: 'Propose to the design system',
    proposed: 'Proposed',
    history: 'History',
    revert: 'Go back to this',
    undoTurn: 'Undo this turn',
    tweaks: 'Tweaks',
    comments: 'Comments',
    edit: 'Edit',
    variations: 'Variations',
    choose: 'Use this layout',
    newScreen: 'New screen',
    templates: 'Templates',
    noScreens: 'No screens yet. Describe one in the chat, or add a screen.',
    storylines: 'Storylines',
    defaultStoryline: 'All screens',
    addComment: 'Add comment',
    resolve: 'Resolve',
    reopen: 'Reopen',
    templateSet: 'Templates this design may use',
    allTemplates: 'Every template of the design system',
    saveRevision: 'Save as a revision',
    discard: 'Discard changes',
    screens: 'Screens',
    openInSubject: 'Open',
    noTweaks: 'Nothing to tweak yet. Ask for tweaks in the chat.',
    noHistory: 'This screen has no revisions yet.',
    noComments: 'No comments on this screen.',
};

/** The words to show: the host's where it has them, the defaults otherwise. */
export const designStringsOf = (overrides: DesignCanvasStrings | undefined): Record<DesignStringKey, string> =>
    ({ ...defaultDesignStrings, ...Object.fromEntries(Object.entries(overrides ?? {}).filter(([, value]) => value !== undefined)) });
