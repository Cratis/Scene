// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a template tells its page header.
 *
 * `query` and `command` are separate and both optional, and at most one is ever set - which is the header
 * component's contract, not a convenience here: a page is *about* one thing, and a header bound to both a
 * query and a command would have nothing sensible to say about either. Setting neither is allowed and
 * means the header states that no binding was named, which is a legitimate design-time state.
 */
export interface ArcHeaderOptions {
    /** The heading. Left out to let the header read the binding name as a sentence instead. */
    title?: string;

    /** The line under the heading. */
    subtitle?: string;

    /** The section this page belongs to, which becomes the first entry of the derived breadcrumb trail. */
    section?: string;

    /** The query this page is about. */
    query?: string;

    /** The command this page is about. */
    command?: string;
}
