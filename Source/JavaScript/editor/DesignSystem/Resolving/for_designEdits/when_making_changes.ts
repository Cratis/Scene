// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { addThemeChange, defaultThemeChange, partChange, removeThemeChange, roleChange, valueChange, wordChange } from '../designEdits';

describe('when making changes', () => {
    it('should declare a token role', () => roleChange('color', 'accent', 'links').should.deep.equal({ path: 'tokens.color.accent', value: 'links' }));
    it('should set a color of the default theme in one mode', () => valueChange('Product', true, 'color', 'accent', 'dark', '#fff').should.deep.equal({ path: 'dark.color.accent', value: '#fff' }));
    it('should set a value of another theme in every mode', () => valueChange('Brand', false, 'radius', 'control', undefined, '4px').should.deep.equal({ path: 'theme.Brand.values.radius.control', value: '4px' }));
    it('should set a part of a variant', () => partChange('Button', 'primary', 'default', 'text', 'color.accent').should.deep.equal({ path: 'components.Button.variants.primary.text', value: 'color.accent' }));
    it('should set a part of a state', () => partChange('Button', 'primary', 'hover', 'text', 'color.accent').path.should.equal('components.Button.variants.primary.states.hover.text'));
    it('should set a word', () => wordChange('voice', 'tone', 'Plain').should.deep.equal({ path: 'words.voice.tone', value: 'Plain' }));
    it('should add a theme as a copy', () => addThemeChange('Brand', 'Product').should.deep.equal({ path: 'themes.Brand', value: 'Product' }));
    it('should remove a theme by giving it no copy source', () => removeThemeChange('Brand').should.deep.equal({ path: 'themes.Brand', value: '' }));
    it('should make a theme the default', () => defaultThemeChange('Brand').should.deep.equal({ path: 'default-theme', value: 'Brand' }));
});
