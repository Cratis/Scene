// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One item an inspector checks off. */
export interface ChecklistItem {
    id: string;
    property: string;
    label: string;
    required: boolean;
}
