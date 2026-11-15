// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export enum DropRegionKind {

    // The body of a container - dropping here appends. This is also the only region an empty container has.
    Container = 'container',

    // The gap between two siblings, or before the first or after the last.
    Between = 'between',
}
