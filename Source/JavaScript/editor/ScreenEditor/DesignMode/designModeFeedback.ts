// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What a person is told about an action that came to nothing. The announcement is for a screen reader: it is clipped out of sight. The notice is the toast
// everyone sees. A refusal needs both - one that is only announced looks, to a sighted person, like a button that does nothing.
export interface DesignModeFeedback {
    announcement: string;
    notice: string;
}

export const refusedFeedback = (message: string): DesignModeFeedback => ({ announcement: message, notice: message });

// How the "+" that adds an item is offered: pressable, or - on a screen open to be read - drawn dimmed with the reason in place of its label.
export interface AddOffer {
    disabled: boolean;
    title: string;
}

export const addOfferOf = (label: string, readOnlyReason: string | undefined): AddOffer => readOnlyReason === undefined
    ? { disabled: false, title: label }
    : { disabled: true, title: readOnlyReason };
