// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The reasons inspection, editing, binding validation and configuration resolution report a problem. A host
 * switches on the code; the message is for a person.
 */
export enum DiagnosticCode {
    // Addressing
    UnknownNode = 'unknownNode',
    DuplicateElementId = 'duplicateElementId',
    UnknownScope = 'unknownScope',
    InvalidEdit = 'invalidEdit',

    // Properties
    UnknownProperty = 'unknownProperty',
    InvalidValue = 'invalidValue',
    ReadOnlyProperty = 'readOnlyProperty',
    NodeNotEditable = 'nodeNotEditable',
    MissingComponentDescriptor = 'missingComponentDescriptor',

    // Layout
    NotALayoutNode = 'notALayoutNode',
    LayoutTypeNotConvertible = 'layoutTypeNotConvertible',
    LossyConversionNotAccepted = 'lossyConversionNotAccepted',
    LossyConversion = 'lossyConversion',

    // Structure
    TargetDoesNotAcceptChildren = 'targetDoesNotAcceptChildren',
    UnknownSlot = 'unknownSlot',
    ContainmentCycle = 'containmentCycle',
    IndexOutOfRange = 'indexOutOfRange',
    ElementIdInUse = 'elementIdInUse',
    MaximumChildrenExceeded = 'maximumChildrenExceeded',
    NodeNotRemovable = 'nodeNotRemovable',

    // Query binding
    MissingQuery = 'missingQuery',
    IncompatibleResultShape = 'incompatibleResultShape',
    MissingRequiredParameter = 'missingRequiredParameter',
    UnknownParameter = 'unknownParameter',
    ArgumentTypeMismatch = 'argumentTypeMismatch',
    UnresolvedArgumentSource = 'unresolvedArgumentSource',
    UnknownResultField = 'unknownResultField',

    // Exposure and instance configuration
    ExposureTargetMissing = 'exposureTargetMissing',
    ExposureWidensOwner = 'exposureWidensOwner',
    ReExposureBroken = 'reExposureBroken',
    ContributionNotExposed = 'contributionNotExposed',
    ContributionTargetMissing = 'contributionTargetMissing',
    ContributionTypeMismatch = 'contributionTypeMismatch',
    ContributionOperationNotPermitted = 'contributionOperationNotPermitted',
    UnknownCollectionField = 'unknownCollectionField',
    CollectionItemNotFound = 'collectionItemNotFound',
    DuplicateCollectionItem = 'duplicateCollectionItem',
    UnknownInstance = 'unknownInstance',

    // Icons
    MissingIconLibrary = 'missingIconLibrary',
    MissingIcon = 'missingIcon',
    MissingIconVariant = 'missingIconVariant',
    IncompatibleIconLibrary = 'incompatibleIconLibrary',
    IconCatalogUnavailable = 'iconCatalogUnavailable',
    IconNotVerified = 'iconNotVerified',
}
