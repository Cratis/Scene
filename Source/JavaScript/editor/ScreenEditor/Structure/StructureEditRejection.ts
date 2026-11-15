// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Why a structure edit was refused.
export enum StructureEditRejection {
    NodeNotFound = 'nodeNotFound',
    TargetNotFound = 'targetNotFound',
    TargetNotContainer = 'targetNotContainer',
    WouldCreateCycle = 'wouldCreateCycle',
    NodeLocked = 'nodeLocked',
    TargetLocked = 'targetLocked',
    NoChange = 'noChange',
}
