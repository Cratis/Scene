// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack, SampleShape, UiProfile } from '@cratis/scene.model';

/** Which rung of the resolution order supplied the rows. */
export type SampleDataResolutionSource =
    /** A pack explicitly bound to the read model or shape. */
    | 'binding'
    /** The application's active pack: the profile's `sampleData.activePack`, or the session override. */
    | 'activePack'
    /** The default pack of the blueprint the template came from. */
    | 'blueprintDefault'
    /** Generated, typed by field kind. */
    | 'generated'
    /** Not resolved, because the host is not in design or preview mode (SD6). */
    | 'disabled'
    /** No pack had rows and no shape was given to generate from. */
    | 'none';

/** What is being asked for: rows for a read model or shape. */
export interface SampleDataRequest {
    /** The read model or shape name; defaults to the `shape`'s name when only a shape is given. */
    target?: string;

    /** The shape of one row; needed for the generated rung to produce anything. */
    shape?: SampleShape;
}

/** What the host knows when it asks for sample data. */
export interface SampleDataContext {
    /** Every pack available: blueprint packs and the author's own. */
    packs: SampleDataPack[];

    /**
     * The application's UI profile, whose `sampleData` is the one place the active pack is chosen (plus the
     * rare mappings and bindings). Absent, or a profile without `sampleData`, behaves as no active pack, no
     * mappings and no bindings.
     */
    profile?: Pick<UiProfile, 'sampleData'>;

    /**
     * A session-only override of the profile's active pack, as the preview strip's selector sets it: a pack
     * id replaces `profile.sampleData.activePack`, the empty string (the generated entry's id) means no
     * active pack, and `undefined` (absent) leaves the profile's choice. It is never a second source of truth: it is not stored, and bindings and
     * mappings still come from the profile.
     */
    sessionActivePack?: string;

    /** The default pack of the blueprint the template came from. */
    blueprintDefaultPack?: string;

    /** The locale of generated data when no pack supplies one; defaults to `en-GB`. */
    locale?: string;

    /** The seed for generated data; defaults to 1 so previews are stable. */
    seed?: number;

    /** The number of generated rows; defaults to 5. */
    rowCount?: number;

    /**
     * Whether the host is design time or preview. Sample data resolves only when this is true; a Stage
     * production build leaves it false (the default) and gets nothing (SD6).
     */
    isDesignOrPreview?: boolean;
}

/** A problem found while resolving, which never stops the resolution falling through to the next rung. */
export interface SampleDataDiagnostic {
    /** `packNotFound` or `shapeNotInPack`. */
    code: string;
    message: string;
}

/** The outcome of {@link resolveSampleData}. */
export interface SampleDataResolution {
    /** Which rung supplied the rows. */
    source: SampleDataResolutionSource;

    /** The identity of the pack that supplied the rows; absent for generated, disabled and none. */
    pack?: string;

    /** The locale of the data: the pack's, or the one generated data followed. */
    locale: string;

    /** The shape name the rows belong to. */
    shape?: string;

    rows: Record<string, unknown>[];

    diagnostics: SampleDataDiagnostic[];
}
