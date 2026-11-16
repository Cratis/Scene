// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The words of the crash panel, which says what failed instead of leaving a blank page. */
export interface CrashStrings {
    /** The heading: `{surface}` is what stopped, such as `The preview`. */
    title: string;

    /** The line under the heading. */
    lead: string;

    // The line under the heading when the report dialog has opened by itself. Falls back to the English default.
    leadReporting?: string;

    /** The label of the line that names the surface. */
    surface: string;

    /** The label of the line that names the component that threw. */
    component: string;

    /** The label of the line that names the template. */
    template: string;

    /** The label of the line that names the screen. */
    screen: string;

    /** The label of the line that carries the error text. */
    error: string;

    /** Reloads the page. */
    reload: string;

    /** Rebuilds what failed without reloading the page. */
    tryAgain: string;

    /** Leaves what failed, when it is something that can be left (a preview, an editor). */
    close: string;

    /** Copies the technical detail and opens a prefilled issue. */
    report: string;

    /** Said after the technical detail was copied. */
    copied: string;

    /** Said when the technical detail could not be copied; it is shown to copy by hand. */
    copyFailed: string;

    /** The label of the disclosure that holds the technical detail. */
    technicalDetail: string;
}

/** English words, for specs and for the places that have none of their own. */
export const defaultCrashStrings: CrashStrings = {
    title: '{surface} stopped',
    lead: 'Something failed while drawing this. Nothing you have saved is lost.',
    leadReporting: 'Something failed while drawing this. Nothing you have saved is lost. The report form is open: add what you were doing and send it.',
    surface: 'Where',
    component: 'Component',
    template: 'Template',
    screen: 'Screen',
    error: 'Error',
    reload: 'Reload',
    tryAgain: 'Try again',
    close: 'Close',
    report: 'Report this error',
    copied: 'The technical detail is copied. Paste it into the report.',
    copyFailed: 'The technical detail could not be copied. Select it below and copy it.',
    technicalDetail: 'Technical detail',
};
