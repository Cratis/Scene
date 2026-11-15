// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FreeformArrangement, SizeClass } from '@cratis/scene.model';
import { findMissingVariants } from './findMissingVariants';
import './FreeformArtboardPicker.css';

export interface FreeformArtboardPickerProps {
    arrangement: FreeformArrangement;

    /** The size classes the active `ui profile` targets - the Xcode-storyboard device/orientation picker's own entries. */
    targetSizeClasses: SizeClass[];

    onSizeClassSelected?: (sizeClass: SizeClass) => void;
}

/**
 * The freeform artboard picker for StudioIssues#161: one entry per size class the active `ui profile`
 * targets, greyed out and flagged when the layout has no matching `variant` for it - so a missing artboard
 * is visible on the picker itself, not only discovered by switching to it.
 */
export function FreeformArtboardPicker({ arrangement, targetSizeClasses, onSizeClassSelected }: FreeformArtboardPickerProps) {
    const missing = new Set(findMissingVariants(arrangement, targetSizeClasses).map(sizeClassKey));

    return (
        <ul className="studio-editor-freeform-artboard-picker">
            {targetSizeClasses.map(sizeClass => {
                const isMissing = missing.has(sizeClassKey(sizeClass));
                return (
                    <li
                        key={sizeClassKey(sizeClass)}
                        className={isMissing ? 'studio-editor-freeform-artboard-picker-missing' : undefined}
                        onClick={() => onSizeClassSelected?.(sizeClass)}
                    >
                        {sizeClass.width} × {sizeClass.height}
                        {isMissing && <span className="studio-editor-freeform-artboard-picker-warning"> no variant</span>}
                    </li>
                );
            })}
        </ul>
    );
}

function sizeClassKey(sizeClass: SizeClass): string {
    return `${sizeClass.width}:${sizeClass.height}`;
}
