// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { sampleDesignSystem } from '../../Testing/sampleDesignSystem';
import { contrastFindingsOf, contrastFor, passes, ratioLabel, unreadableCount } from '../contrast';

describe('when reading contrast', () => {
    const design = sampleDesignSystem();
    const findings = contrastFindingsOf(design);

    it('should measure the design system\'s rules when it carries no findings', () => findings.length.should.be.greaterThan(0));
    it('should measure once for a design system', () => contrastFindingsOf(design).should.equal(findings));
    it('should use the findings a design system carries', () => {
        const carried = { ...design, contrastFindings: [] };
        contrastFindingsOf(carried).should.deep.equal([]);
    });

    it('should find the text of a variant on its background in a theme and mode', () => {
        const finding = contrastFor(findings, 'Acme', 'Shell', 'default', 'default', 'light')!;
        [finding.foreground, finding.background].should.deep.equal(['text', 'background']);
    });
    it('should find a state by its name', () => (contrastFor(findings, 'Acme', 'Menu', 'default', 'hover', 'light') !== undefined).should.be.true);
    it('should find nothing for a state the variant has not got', () => (contrastFor(findings, 'Acme', 'Shell', 'default', 'hover', 'light') === undefined).should.be.true);
    it('should report no state that is disabled', () => findings.some(finding => finding.state === 'disabled').should.be.false);

    it('should find the default theme readable', () => unreadableCount(findings.filter(finding => finding.theme === 'Acme')).should.equal(0));
    it('should find the brand theme hard to read', () => unreadableCount(findings.filter(finding => finding.theme === 'Brand')).should.be.greaterThan(0));
    it('should say a pair that reaches the ratio passes', () => passes(contrastFor(findings, 'Acme', 'Shell', 'default', 'default', 'light')!).should.be.true);
    it('should say a pair that falls short does not pass', () => passes(contrastFor(findings, 'Brand', 'Shell', 'default', 'default', 'light')!).should.be.false);
    it('should write a ratio with one decimal', () => ratioLabel({ ...findings[0], ratio: 4.56 }).should.equal('4.6:1'));
});
