// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** An ordered path through some of a set's screens: a story a user goes through. */
export interface Storyline {
    name: string;
    title?: string;
    steps: string[];
}

export const StorylinePropertyNames: (keyof Storyline)[] = ['name', 'title', 'steps'];
