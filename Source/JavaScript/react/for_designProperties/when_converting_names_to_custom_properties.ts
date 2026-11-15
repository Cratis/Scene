// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { designAnatomyProperty, designTokenProperty } from '../index';

describe('when converting names to custom properties', () => {
    it('should join component, variant and part for the variant\'s own value', () => designAnatomyProperty('Button', 'primary', 'background').should.equal('--ds-button-primary-background'));
    it('should append the state for a state\'s value', () => designAnatomyProperty('Button', 'primary', 'background', 'hover').should.equal('--ds-button-primary-background-hover'));
    it('should kebab-case a camel-case segment', () => designAnatomyProperty('StatusChip', 'success', 'text').should.equal('--ds-status-chip-success-text'));
    it('should turn any separator into a dash', () => designAnatomyProperty('Side bar', 'on_dark', 'text').should.equal('--ds-side-bar-on-dark-text'));
    it('should keep a raw token role under its own prefix', () => designTokenProperty('color.text-muted').should.equal('--ds-token-color-text-muted'));
    it('should flatten a camel-case role', () => designTokenProperty('shadow.focusRing').should.equal('--ds-token-shadow-focus-ring'));
});
