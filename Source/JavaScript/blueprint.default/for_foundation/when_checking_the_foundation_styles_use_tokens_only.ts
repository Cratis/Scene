// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const stylesheet = readFileSync(join(__dirname, '..', 'shell', 'layout.css'), 'utf8');
const section = stylesheet.slice(stylesheet.indexOf('FOUNDATION COMPONENTS'));

interface Declaration { selector: string; property: string; value: string }

/** The declarations of the foundation section, with the `var(...)` calls - tokens and their fallbacks - taken out of the value. */
function declarations(): Declaration[] {
    const result: Declaration[] = [];
    for (const rule of section.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
        for (const declaration of rule[2].split(';')) {
            const separator = declaration.indexOf(':');
            if (separator < 0) continue;
            result.push({ selector: rule[1].trim(), property: declaration.slice(0, separator).trim(), value: declaration.slice(separator + 1).trim() });
        }
    }
    return result;
}

const withoutTokens = (value: string) => value.replace(/var\((?:[^()]|\([^()]*\))*\)/g, '');
const spacingProperties = /^(padding|margin|gap|row-gap|column-gap|inset|top|bottom|left|right)(-|$)/;

// Spec Part B 1.5: theming uses only theme tokens, with no hard-coded colors or spacing.
describe('when checking the foundation styles use tokens only', () => {
    const all = declarations().filter(declaration => !declaration.property.startsWith('--'));

    it('should find the foundation rules', () => all.length.should.be.greaterThan(40));

    it('should not write a color literal outside a token fallback', () =>
        all.filter(_ => /#[0-9a-f]{3,8}\b|\b(rgb|hsl)a?\(|\b(white|black|red|green|blue|gray|grey)\b/i.test(withoutTokens(_.value)))
            .map(_ => `${_.selector} { ${_.property}: ${_.value} }`).should.deep.equal([]));

    it('should not write a spacing length outside the spacing tokens', () =>
        all.filter(_ => spacingProperties.test(_.property) && !_.selector.includes('visually-hidden') && /\d(px|rem|em)\b/.test(withoutTokens(_.value)))
            .map(_ => `${_.selector} { ${_.property}: ${_.value} }`).should.deep.equal([]));

    it('should size the alias block from the Scene tokens', () => {
        const aliases = section.slice(section.indexOf('.foundation {'), section.indexOf('}', section.indexOf('.foundation {')));
        aliases.match(/--foundation-(?!space|row)[a-z-]+: var\(--scene-/g)!.length.should.be.greaterThan(15);
    });
});
