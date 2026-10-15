// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// The kind of slice a template is applied to when the target scope is <see cref="TemplateScope.Slice"/>.
/// The members match the slice kinds of the application hierarchy.
/// </summary>
public enum TemplateSliceKind
{
    /// <summary>
    /// A slice that changes state - a command. Offers dialog, form and wizard templates.
    /// </summary>
    StateChange = 0,

    /// <summary>
    /// A slice that presents state - a read model. Offers data-display fragments such as list and detail.
    /// </summary>
    StateView = 1,

    /// <summary>
    /// A slice that reacts to events without presenting anything. It has no presentation, so no template applies.
    /// </summary>
    Automation = 2
}
