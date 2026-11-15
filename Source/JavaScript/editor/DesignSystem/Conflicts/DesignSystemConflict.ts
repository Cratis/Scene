// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a conflict is about. */
export type DesignSystemConflictKind = 'color' | 'corner';

/** Where one of the competing values is used. */
export interface ConflictPlace {
    /** The file, as `repository: path`. */
    source: string;

    /** How many times the file uses the value. */
    count: number;
}

/** One of the values competing in a conflict. */
export interface ConflictOption {
    /** The value, as the sources write it. */
    value: string;

    /** How many times the sources use it. */
    count: number;

    /** The files that use it most. */
    places: ConflictPlace[];
}

/** Two or more values the sources use for what looks like the same purpose, for a person to settle. */
export interface DesignSystemConflict {
    /** The identity. */
    id: string;

    /** What it is about. */
    kind: DesignSystemConflictKind;

    /** What the choice is, in words. */
    title: string;

    /** The competing values, the most used first. */
    options: ConflictOption[];
}

/** A conflict in a draft and what was decided about it. */
export interface DesignSystemConflictEntry {
    /** The draft it belongs to. */
    version: number;

    /** The conflict. */
    conflict: DesignSystemConflict;

    /** The value that was kept - empty while nobody has decided. */
    chosen: string;

    /** Who decided - empty while nobody has. */
    decidedBy: string;

    /** Whether an issue for the code that should change was raised. */
    issueRaised: boolean;
}
