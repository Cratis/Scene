// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One choice of a {@link Segmented}. */
export interface SegmentedOption {
    /** What choosing it sets. */
    value: string;

    /** What it is called. */
    label: string;

    /** How many it holds, shown beside the label. */
    count?: number;
}

export interface SegmentedProps {
    /** What is chosen between - its accessible name. */
    label: string;

    /** The choice made. */
    value: string;

    /** The choices. */
    options: readonly SegmentedOption[];

    /** Called with the choice a person makes. */
    onChange: (value: string) => void;
}

/** A few mutually exclusive choices drawn side by side, the one made pressed. */
export const Segmented = ({ label, value, options, onChange }: SegmentedProps) => (
    <div className='studio-design-system__segmented' role='group' aria-label={label}>
        {options.map(option => (
            <button
                key={option.value}
                type='button'
                className='studio-design-system__segment'
                aria-pressed={option.value === value}
                onClick={() => onChange(option.value)}>
                {option.label}
                {option.count !== undefined && <span className='studio-design-system__segment-count'>{option.count}</span>}
            </button>
        ))}
    </div>
);
