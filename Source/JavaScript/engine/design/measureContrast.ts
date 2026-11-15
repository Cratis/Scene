// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ContrastFinding, DesignSystem, ResolvedDesignComponent } from '@cratis/scene.model';
import { parseHexColor } from '../profiles/resolveAppearance';
import { evaluateDesignComponents } from './evaluateDesignComponents';

const rgbPattern = /^rgba?\(\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*(?:[,/]\s*[\d.]+%?\s*)?\)$/i;

/** The state a rule never applies to: a disabled control is exempt from contrast requirements. */
const exemptState = 'disabled';

function channels(color: string): [number, number, number] | undefined {
    const text = color.trim();
    const hex = parseHexColor(text);
    if (hex !== undefined) return hex;
    const match = rgbPattern.exec(text);
    if (match === null) return undefined;
    const rgb = [Number(match[1]), Number(match[2]), Number(match[3])] as [number, number, number];
    return rgb.every(channel => channel <= 255) ? rgb : undefined;
}

function luminance(rgb: [number, number, number]): number {
    const [red, green, blue] = rgb.map(channel => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * Measures the WCAG contrast ratio of one color against another. Only colors written as hex (`#rgb`, `#rrggbb`, `#rrggbbaa`) or `rgb(...)`
 * literals can be measured; a named color, a gradient or a reference is not checked.
 *
 * @param foreground The color drawn on the background.
 * @param background The color it is drawn on.
 * @returns The ratio, rounded to two decimals, or `undefined` when either color cannot be measured.
 */
export function contrastRatio(foreground: string, background: string): number | undefined {
    const front = channels(foreground);
    const back = channels(background);
    if (front === undefined || back === undefined) return undefined;
    const a = luminance(front);
    const b = luminance(back);
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
}

function measureComponents(
    findings: ContrastFinding[],
    designSystem: DesignSystem,
    theme: string,
    mode: string,
    components: readonly ResolvedDesignComponent[]
): void {
    for (const rule of designSystem.contrastRules ?? []) {
        for (const component of components) {
            for (const variant of component.variants) {
                const pairs: [string | undefined, Record<string, string>][] = [[undefined, variant.parts]];
                for (const [state, parts] of Object.entries(variant.states ?? {})) {
                    if (state !== exemptState) pairs.push([state, parts]);
                }

                for (const [state, parts] of pairs) {
                    const foreground = parts[rule.foreground];
                    const background = parts[rule.background];
                    if (foreground === undefined || background === undefined) continue;
                    const ratio = contrastRatio(foreground, background);
                    if (ratio === undefined) continue;
                    findings.push({
                        theme, mode, component: component.name, variant: variant.name, ...(state === undefined ? {} : { state }),
                        foreground: rule.foreground, background: rule.background, ratio, required: rule.minimumRatio,
                    });
                }
            }
        }
    }
}

/**
 * Measures every contrast rule of a design system for every theme and mode, over every variant and every state except `disabled`.
 * A pair that falls short is a finding whose `ratio` is below its `required`; a pair that cannot be measured is left out.
 *
 * @param designSystem The design system.
 * @returns The findings, in theme, mode, component, variant, state order.
 */
export function measureDesignContrast(designSystem: DesignSystem): ContrastFinding[] {
    const findings: ContrastFinding[] = [];
    for (const theme of designSystem.themes) {
        for (const values of theme.modes) {
            const components = values.components ?? evaluateDesignComponents(designSystem.components, values.tokens, false).components;
            measureComponents(findings, designSystem, theme.name, values.mode, components);
        }
    }

    return findings;
}
