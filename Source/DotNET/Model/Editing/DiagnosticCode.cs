// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Editing;

/// <summary>
/// The reasons inspection, editing, binding validation and configuration resolution report a problem. A host switches on the code; the message is for a person.
/// </summary>
public enum DiagnosticCode
{
    /// <summary>
    /// There is no node with the id.
    /// </summary>
    UnknownNode = 0,

    /// <summary>
    /// An element id is used more than once.
    /// </summary>
    DuplicateElementId = 1,

    /// <summary>
    /// The editing scope is not in the document.
    /// </summary>
    UnknownScope = 2,

    /// <summary>
    /// The edit is not one the engine knows.
    /// </summary>
    InvalidEdit = 3,

    /// <summary>
    /// The node has no such property.
    /// </summary>
    UnknownProperty = 4,

    /// <summary>
    /// The value does not fit the property.
    /// </summary>
    InvalidValue = 5,

    /// <summary>
    /// The property is read-only.
    /// </summary>
    ReadOnlyProperty = 6,

    /// <summary>
    /// The node is inherited and cannot be changed here.
    /// </summary>
    NodeNotEditable = 7,

    /// <summary>
    /// No descriptor describes the component.
    /// </summary>
    MissingComponentDescriptor = 8,

    /// <summary>
    /// The node is not a layout node.
    /// </summary>
    NotALayoutNode = 9,

    /// <summary>
    /// The layout type cannot be converted to the requested one.
    /// </summary>
    LayoutTypeNotConvertible = 10,

    /// <summary>
    /// The conversion loses information and the author did not accept that.
    /// </summary>
    LossyConversionNotAccepted = 11,

    /// <summary>
    /// The conversion lost information.
    /// </summary>
    LossyConversion = 12,

    /// <summary>
    /// The target does not take children.
    /// </summary>
    TargetDoesNotAcceptChildren = 13,

    /// <summary>
    /// The slot does not exist.
    /// </summary>
    UnknownSlot = 14,

    /// <summary>
    /// A node cannot be placed inside itself.
    /// </summary>
    ContainmentCycle = 15,

    /// <summary>
    /// The index is outside the list.
    /// </summary>
    IndexOutOfRange = 16,

    /// <summary>
    /// The element id is already used in the document.
    /// </summary>
    ElementIdInUse = 17,

    /// <summary>
    /// The target cannot hold more children.
    /// </summary>
    MaximumChildrenExceeded = 18,

    /// <summary>
    /// The node cannot be removed.
    /// </summary>
    NodeNotRemovable = 19,

    /// <summary>
    /// The query is not available.
    /// </summary>
    MissingQuery = 20,

    /// <summary>
    /// The query returns a shape the property does not accept.
    /// </summary>
    IncompatibleResultShape = 21,

    /// <summary>
    /// A required query parameter has no argument.
    /// </summary>
    MissingRequiredParameter = 22,

    /// <summary>
    /// The query has no such parameter.
    /// </summary>
    UnknownParameter = 23,

    /// <summary>
    /// An argument does not fit its parameter.
    /// </summary>
    ArgumentTypeMismatch = 24,

    /// <summary>
    /// An argument source is not available.
    /// </summary>
    UnresolvedArgumentSource = 25,

    /// <summary>
    /// The query does not return the field.
    /// </summary>
    UnknownResultField = 26,

    /// <summary>
    /// The exposed component or property is not in the owner.
    /// </summary>
    ExposureTargetMissing = 27,

    /// <summary>
    /// A re-exposure grants more than the owner it passes on.
    /// </summary>
    ExposureWidensOwner = 28,

    /// <summary>
    /// A re-exposure no longer has an owner to narrow.
    /// </summary>
    ReExposureBroken = 29,

    /// <summary>
    /// The instance contributes to something that was not exposed to it.
    /// </summary>
    ContributionNotExposed = 30,

    /// <summary>
    /// The contribution names a component that is not there.
    /// </summary>
    ContributionTargetMissing = 31,

    /// <summary>
    /// The contribution does not fit the exposed property.
    /// </summary>
    ContributionTypeMismatch = 32,

    /// <summary>
    /// The exposure does not permit the operation.
    /// </summary>
    ContributionOperationNotPermitted = 33,

    /// <summary>
    /// The collection item has no such field.
    /// </summary>
    UnknownCollectionField = 34,

    /// <summary>
    /// There is no collection item with the id.
    /// </summary>
    CollectionItemNotFound = 35,

    /// <summary>
    /// A collection item id is used twice.
    /// </summary>
    DuplicateCollectionItem = 36,

    /// <summary>
    /// There is no such instance.
    /// </summary>
    UnknownInstance = 37,

    /// <summary>
    /// The profile has no such icon library.
    /// </summary>
    MissingIconLibrary = 38,

    /// <summary>
    /// The library has no such icon.
    /// </summary>
    MissingIcon = 39,

    /// <summary>
    /// The icon has no such variant.
    /// </summary>
    MissingIconVariant = 40,

    /// <summary>
    /// The icon library is at an incompatible version.
    /// </summary>
    IncompatibleIconLibrary = 41,

    /// <summary>
    /// The icon catalog could not be loaded.
    /// </summary>
    IconCatalogUnavailable = 42,

    /// <summary>
    /// The icon could not be verified.
    /// </summary>
    IconNotVerified = 43,

    /// <summary>
    /// The component names no category.
    /// </summary>
    ComponentCategoryMissing = 44,

    /// <summary>
    /// The component names an unknown category.
    /// </summary>
    ComponentCategoryUnknown = 45,

    /// <summary>
    /// The component's design mode is not sound.
    /// </summary>
    ComponentDesignModeInvalid = 46,

    /// <summary>
    /// The property's editor options are not sound.
    /// </summary>
    PropertyEditorOptionsInvalid = 47,
}
