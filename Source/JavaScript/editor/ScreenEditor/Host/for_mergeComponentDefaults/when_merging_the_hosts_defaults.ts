// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screenEditorPrimeReactDefaults } from '../screenEditorPrimeReactDefaults';
import { mergeComponentDefaults } from '../mergeComponentDefaults';

const editor = { Button: { props: { styles: 'button-styles' } }, Card: { props: { styles: 'card-styles' } } };
type Merged = Record<string, { props: Record<string, unknown> }>;
const merge = (host?: Record<string, unknown>) => mergeComponentDefaults(editor, host) as unknown as Merged;

describe('when the host gives a prop to a component the editor styles', () => {
    const merged = merge({ Button: { props: { size: 'small' } } });

    it('should add the prop', () => merged.Button.props.size!.should.equal('small'));
    it('should keep the editor\'s styles', () => merged.Button.props.styles!.should.equal('button-styles'));
    it('should leave the other components alone', () => merged.Card.props.styles!.should.equal('card-styles'));
});

describe('when the host sets a prop the editor also sets', () => {
    it('should take the host\'s', () => merge({ Button: { props: { styles: 'mine' } } }).Button.props.styles!.should.equal('mine'));
});

describe('when the host gives a component the editor has nothing for', () => {
    it('should add it as given', () => merge({ Slider: { props: { step: 5 } } }).Slider.props.step!.should.equal(5));
});

describe('when the host gives no defaults', () => {
    it('should give the editor\'s as they are', () => (mergeComponentDefaults(editor, undefined) === editor).should.be.true);
});

describe('when the host gives part of an entry other than its props', () => {
    it('should keep the editor\'s props', () => (mergeComponentDefaults(editor, { Button: { pt: { root: 'x' } } }) as unknown as Merged).Button.props.styles!.should.equal('button-styles'));
});

describe('when the real editor defaults are merged with a host entry for every component', () => {
    const hostEntries = Object.fromEntries(Object.keys(screenEditorPrimeReactDefaults).map(key => [key, { props: { hostProp: true } }]));
    const merged = mergeComponentDefaults(screenEditorPrimeReactDefaults, hostEntries) as unknown as Record<string, { props?: { styles?: unknown; hostProp?: boolean } }>;
    const styled = Object.entries(screenEditorPrimeReactDefaults).filter(([, entry]) => (entry as { props?: { styles?: unknown } }).props?.styles !== undefined).map(([key]) => key);

    it('should keep every style the editor hands out', () => styled.filter(key => merged[key].props?.styles === undefined).should.deep.equal([]));
    it('should carry the host\'s prop on every component', () => Object.values(merged).every(entry => entry.props?.hostProp === true).should.be.true);
});
