// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContrastFinding, DesignSystem } from '@cratis/scene.model';
import { measureDesignContrast } from '@cratis/scene.engine';
import { defaultState } from '../Resolving/designResolution';

const measured = new WeakMap<DesignSystem, ContrastFinding[]>();

/**
 * The contrast of every pair of parts a design system holds a rule about: the findings the design system carries, or - when it
 * carries none - what its rules measure to. A design system is measured once; the editor asks for it on every draw.
 *
 * @param design The design system.
 * @returns The findings.
 */
export const contrastFindingsOf = (design: DesignSystem): ContrastFinding[] => {
    if (design.contrastFindings !== undefined) return design.contrastFindings;
    let findings = measured.get(design);
    if (findings === undefined) {
        findings = measureDesignContrast(design);
        measured.set(design, findings);
    }
    return findings;
};

/**
 * Whether a pair is readable.
 *
 * @param finding The finding.
 * @returns True when the measured ratio reaches the one the rule asks for.
 */
export const passes = (finding: ContrastFinding): boolean => finding.ratio >= finding.required;

/**
 * The contrast of a variant's text on its background in a theme, state and mode.
 *
 * @param findings The contrast the design system reports.
 * @param theme The theme.
 * @param component The component.
 * @param variant The variant.
 * @param state The state - a disabled state is not reported.
 * @param mode The mode.
 * @returns The finding, or undefined when the pair is not a color the engine could measure.
 */
export const contrastFor = (findings: readonly ContrastFinding[], theme: string, component: string, variant: string, state: string, mode: string): ContrastFinding | undefined =>
    findings.find(finding =>
        finding.theme === theme
        && finding.component === component
        && finding.variant === variant
        && (finding.state ?? defaultState) === state
        && finding.mode === mode);

/**
 * How many pairs fall below the ratio their rule asks for.
 *
 * @param findings The contrast the design system reports.
 * @returns The number of foreground and background pairs that are hard to read.
 */
export const unreadableCount = (findings: readonly ContrastFinding[]): number => findings.filter(finding => !passes(finding)).length;

/**
 * Words for a ratio.
 *
 * @param finding The finding.
 * @returns The ratio, like `4.6:1`.
 */
export const ratioLabel = (finding: ContrastFinding): string => `${finding.ratio.toFixed(1)}:1`;
