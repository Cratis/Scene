// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Editing;

/// <summary>
/// Why a changed document was refused. The names are the camel-cased twins of the TypeScript engine's
/// <c language="csharp">DiagnosticCode</c> members that report the same thing, so an editor and a server agree on the reason.
/// </summary>
public enum SceneDocumentViolationCode
{
    /// <summary>
    /// The document is not a Scene document that can be read.
    /// </summary>
    DocumentUnreadable = 0,

    /// <summary>
    /// The screen, template or layout being edited is not in the document.
    /// </summary>
    UnknownScope = 1,

    /// <summary>
    /// Something the scope inherits - a layout, a template, what they expose, what another instance set - was changed.
    /// </summary>
    NodeNotEditable = 2,

    /// <summary>
    /// An exposure names a component the owner does not have.
    /// </summary>
    ExposureTargetMissing = 3,

    /// <summary>
    /// A re-exposure grants more than the owner it passes on granted.
    /// </summary>
    ExposureWidensOwner = 4,

    /// <summary>
    /// A re-exposure passes on something its owner never exposed to it.
    /// </summary>
    ReExposureBroken = 5,

    /// <summary>
    /// An instance set a property that was not exposed to it.
    /// </summary>
    ContributionNotExposed = 6,

    /// <summary>
    /// An instance did something to an exposed collection, or to a field of its items, that was not granted.
    /// </summary>
    ContributionOperationNotPermitted = 7,

    /// <summary>
    /// A collection item id is used more than once.
    /// </summary>
    DuplicateCollectionItem = 8,

    /// <summary>
    /// An exposure or a contribution is not shaped as one.
    /// </summary>
    InvalidEdit = 9
}
