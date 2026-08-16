// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The bare names this package declares components under.
 *
 * There is exactly one, and that is the design rather than an unfinished list. This blueprint's value is
 * in its **templates** - a `dataPage` already wired to a query, a `commandForm` page with its action bar -
 * and a template is data a host can rearrange. A component is code it cannot. So the rule this package
 * holds itself to is: register a component only when a template's content tree genuinely cannot express
 * the composition, and reach for a template every other time. A blueprint whose value sat in its
 * components rather than its templates would have misunderstood its job.
 *
 * {@link ArcPageHeader} is the one thing that clears that bar. Everything else in this package is a tree.
 */
export enum ComponentName {
    /**
     * A page header that derives its heading, its subtitle and its breadcrumb trail from **one** binding
     * name, and reports whether that binding is registered.
     *
     * A content tree cannot do this. It can hold a title, a subtitle and a trail as three literals, but
     * it cannot *derive* them from a single `query`/`command` property, and it certainly cannot look that
     * name up in the binding registry to say whether a host has wired it. Both are behavior at render
     * time, not structure - which is exactly the line this package uses to decide what earns a component.
     */
    ArcPageHeader = 'arcPageHeader',
}
