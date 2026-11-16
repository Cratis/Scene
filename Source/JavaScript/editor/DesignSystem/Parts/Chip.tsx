// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { Tag, type TagSeverity } from '@cratis/components/Display';

/** What a chip says about what it labels. */
export type ChipTone = 'positive' | 'critical' | 'caution' | 'info' | 'neutral';

const severities: Record<ChipTone, TagSeverity> = {
    positive: 'success',
    critical: 'danger',
    caution: 'warn',
    info: 'info',
    neutral: 'secondary',
};

export interface ChipProps {
    /** What the chip says about what it labels. */
    tone?: ChipTone;

    /** What it says. */
    children: ReactNode;
}

/** A short label: a state, a count, a kind. */
export const Chip = ({ tone = 'neutral', children }: ChipProps) => <Tag severity={severities[tone]} rounded>{children}</Tag>;
