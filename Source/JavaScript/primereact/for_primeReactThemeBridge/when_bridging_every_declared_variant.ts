// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buttonForms, buttonSeverities, labelSeverities, messageSeverities, primeReactAnatomy } from '../primeReactAnatomy';

const stylesheet = readFileSync(resolve(import.meta.dirname, '..', 'primeReactTheme.css'), 'utf8');
const declares = (declaration: string) => stylesheet.includes(`${declaration};`);
const missing = (declarations: string[]) => declarations.filter(declaration => !declares(declaration));
const primeSeverity = (variant: string) => variant === 'danger' ? 'error' : variant;

describe('when bridging every variant the anatomy declares', () => {
    it('should declare the variants of the Button the bridge draws', () => primeReactAnatomy.button.variants.should.deep.equal([...buttonSeverities, ...buttonForms]));

    describe('and the variant is a Button severity', () => {
        for (const severity of buttonSeverities) {
            const ds = `--ds-button-${severity}`;
            const p = `--p-button-${severity}`;

            it(`should paint ${severity} from the parts of its design-system variant`, () => missing([
                `${p}-background: var(${ds}-background)`,
                `${p}-color: var(${ds}-text)`,
                `${p}-border-color: var(${ds}-border, var(${ds}-background))`,
                `${p}-focus-ring-shadow: var(${ds}-shadow-focus)`,
            ]).should.deep.equal([]));

            it(`should paint ${severity} in each state from the design system's, else derived from its own background`, () => missing([
                `${p}-hover-background: var(${ds}-background-hover, color-mix(in srgb, var(${ds}-background) 90%, var(--ds-text-default-text)))`,
                `${p}-hover-color: var(${ds}-text-hover, var(${ds}-text))`,
                `${p}-active-background: var(${ds}-background-active, color-mix(in srgb, var(${ds}-background) 80%, var(--ds-text-default-text)))`,
                `${p}-active-color: var(${ds}-text-active, var(${ds}-text))`,
            ]).should.deep.equal([]));

            it(`should draw ${severity} outlined and as text from the same variant`, () => {
                const accent = severity === 'primary' ? 'var(--ds-button-outlined-text, var(--ds-button-primary-background))' : severity === 'secondary' ? 'var(--ds-button-secondary-text)' : `var(${ds}-background)`;
                missing([`--p-button-outlined-${severity}-color: ${accent}`]).should.deep.equal([]);
            });

            if (severity !== 'primary') {
                it(`should fall back to the preset's own ${severity} values when the design system declares none`, () => missing([
                    `${ds}-background: var(${p}-background)`,
                    `${ds}-text: var(${p}-color)`,
                    `${ds}-shadow-focus: var(${p}-focus-ring-shadow)`,
                    `${ds}-radius: var(--p-button-border-radius)`,
                ]).should.deep.equal([]));

                it(`should paint the corners of ${severity} from its radius`, () => stylesheet.includes(`.p-button-${severity} {\n    --p-button-border-radius: var(${ds}-radius);`).should.equal(true));
            }
        }
    });

    describe('and the variant is a Button form', () => {
        it('should paint the outlined form from its design-system variant', () => missing([
            '--p-button-outlined-primary-color: var(--ds-button-outlined-text, var(--ds-button-primary-background))',
            '--p-button-outlined-primary-hover-background: var(--ds-button-outlined-background-hover, color-mix(in srgb, var(--ds-button-outlined-text, var(--ds-button-primary-background)) 8%, transparent))',
        ]).should.deep.equal([]));

        it('should paint the text form from its design-system variant', () => missing([
            '--p-button-text-primary-color: var(--ds-button-text-text, var(--ds-button-primary-background))',
            '--p-button-text-primary-active-background: var(--ds-button-text-background-active, color-mix(in srgb, var(--ds-button-text-text, var(--ds-button-primary-background)) 16%, transparent))',
        ]).should.deep.equal([]));

        it('should paint the link form from its design-system variant', () => missing([
            '--p-button-link-color: var(--ds-button-link-text, var(--ds-button-primary-background))',
            '--p-button-link-hover-color: var(--ds-button-link-text-hover, var(--p-button-link-color))',
        ]).should.deep.equal([]));

        for (const form of buttonForms) {
            it(`should paint the corners of the ${form} form from its radius, else the primary's`, () => stylesheet.includes(`.p-button-${form} {\n    --p-button-border-radius: var(--ds-button-${form}-radius, var(--ds-button-primary-radius));`).should.equal(true));
        }
    });

    describe('and the variant is a Tag or a Badge severity', () => {
        for (const component of ['tag', 'badge']) {
            for (const severity of labelSeverities) {
                it(`should paint the ${severity} ${component} from its design-system variant`, () => missing(severity === 'primary'
                    ? [`--p-${component}-primary-background: var(--ds-${component}-primary-background, var(--ds-button-primary-background))`, `--p-${component}-primary-color: var(--ds-${component}-primary-text, var(--ds-button-primary-text))`]
                    : [`--p-${component}-${severity}-background: var(--ds-${component}-${severity}-background)`, `--p-${component}-${severity}-color: var(--ds-${component}-${severity}-text)`, `--ds-${component}-${severity}-background: var(--p-${component}-${severity}-background)`]
                ).should.deep.equal([]));
            }
        }
    });

    describe('and the variant is a Message severity', () => {
        for (const severity of messageSeverities) {
            it(`should paint the ${severity} message, which PrimeReact calls ${primeSeverity(severity)}, from its design-system variant`, () => missing([
                `--p-message-${primeSeverity(severity)}-background: var(--ds-message-${severity}-background)`,
                `--p-message-${primeSeverity(severity)}-border-color: var(--ds-message-${severity}-border)`,
                `--p-message-${primeSeverity(severity)}-color: var(--ds-message-${severity}-text)`,
                `--ds-message-${severity}-background: var(--p-message-${primeSeverity(severity)}-background)`,
            ]).should.deep.equal([]));
        }
    });
});
