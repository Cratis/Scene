// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// What the list needs of a finding; Scene's diagnostics and the toolbar findings both fit.
export interface ListedDiagnostic {
    code: string;
    severity: string;
    message: string;
    path?: string | undefined;

    // The word for the severity, shown as text so colour is never the only signal (as the bare list does not need it, it is optional).
    severityLabel?: string;

    // Where the finding is, by name; with `jump`, the finding can be gone to.
    where?: string;
    jump?: { label: string; onJump: () => void };
}
import './DiagnosticList.css';

export interface DiagnosticListProps {
    diagnostics: readonly ListedDiagnostic[];
    label: string;
}

// What Scene said about the last edit or the selection - each message once, errors before warnings, announced to assistive technology.
export const DiagnosticList = ({ diagnostics, label }: DiagnosticListProps) => {
    if (diagnostics.length === 0) return null;

    const ordered = [...diagnostics].sort((left, right) => Number(right.severity === 'error') - Number(left.severity === 'error'));
    return (
        <div className='studio-editor-diagnostics__announce' role='alert' aria-label={label}>
            <ul className='studio-editor-diagnostics'>
                {ordered.map((diagnostic, index) => (
                    <li key={`${diagnostic.code}:${diagnostic.path ?? ''}:${index}`} data-severity={diagnostic.severity} data-code={diagnostic.code}>
                        {diagnostic.severityLabel && <strong className='studio-editor-diagnostics__severity'>{diagnostic.severityLabel}</strong>}
                        <span className='studio-editor-diagnostics__message'>{diagnostic.message}</span>
                        {diagnostic.where && <span className='studio-editor-diagnostics__where'>{diagnostic.where}</span>}
                        {diagnostic.jump && <button type='button' className='studio-editor-diagnostics__jump' onClick={diagnostic.jump.onJump}>{diagnostic.jump.label}</button>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
