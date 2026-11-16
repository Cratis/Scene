// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export interface SourceViewProps {
    /** The text. */
    value: string;

    /** What the text is - its accessible name. */
    label: string;
}

/** Source text, read-only, one numbered line after another. */
export const SourceView = ({ value, label }: SourceViewProps) => (
    <pre className='studio-design-system__source' aria-label={label} tabIndex={0}>
        <code>
            {value.split('\n').map((line, index) => <span key={index} className='studio-design-system__source-line'>{line}</span>)}
        </code>
    </pre>
);
