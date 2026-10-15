// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The kind of slice a template is applied to when the target scope is {@link TemplateScope.Slice}.
 * The members match the slice kinds of the application hierarchy.
 */
export enum TemplateSliceKind {
    /** A slice that changes state - a command. Offers dialog, form and wizard templates. */
    StateChange = 'StateChange',
    /** A slice that presents state - a read model. Offers data-display fragments such as list and detail. */
    StateView = 'StateView',
    /** A slice that reacts to events without presenting anything. No template applies. */
    Automation = 'Automation',
}
