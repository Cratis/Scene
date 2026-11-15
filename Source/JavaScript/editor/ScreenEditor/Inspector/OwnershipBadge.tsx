// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Ownership } from '../Structure/Ownership';
import './OwnershipBadge.css';

export interface OwnershipBadgeProps {
    ownership: Ownership;
    label: string;
}

// Marks inherited and configurable-inherited content; local content, the default, is left unmarked.
export const OwnershipBadge = ({ ownership, label }: OwnershipBadgeProps) => (
    ownership === Ownership.Local
        ? null
        : <span className='studio-editor-ownership-badge' data-ownership={ownership}>{label}</span>
);
