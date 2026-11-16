// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplatePreviewSize } from '../../ScreenEditor/Templates/TemplatePreviewSize';
import { templatePreviewGeometry, maxPreviewHeight } from '../templatePreviewGeometry';

describe('when fitting a desktop preview to a narrow pane', () => {
    const geometry = templatePreviewGeometry(TemplatePreviewSize.Desktop, 640);

    it('should lay it out at a desktop window', () => [geometry.designWidth, geometry.designHeight].should.deep.equal([1280, 720]));
    it('should scale it to the width of the pane', () => geometry.scale.should.equal(0.5));
    it('should show it as wide as the pane', () => geometry.width.should.equal(640));
    it('should keep the 16:9 shape', () => geometry.height.should.equal(360));
});

describe('when fitting a desktop preview to a pane wider than the window', () => {
    const geometry = templatePreviewGeometry(TemplatePreviewSize.Desktop, 2560);

    it('should scale it up no further than the height allows', () => geometry.scale.should.equal(maxPreviewHeight / 720));
    it('should keep the shape', () => (geometry.width / geometry.height).should.be.closeTo(1280 / 720, 0.01));
});

describe('when fitting a phone preview to a wide pane', () => {
    const geometry = templatePreviewGeometry(TemplatePreviewSize.Phone, 900);

    it('should scale it to the height there is room for', () => geometry.height.should.equal(maxPreviewHeight));
    it('should be narrower than the pane', () => geometry.width.should.be.below(900));
    it('should keep the shape of a phone', () => (geometry.width / geometry.height).should.be.closeTo(390 / 844, 0.01));
});

describe('when fitting a preview to a pane not yet measured', () => {
    const geometry = templatePreviewGeometry(TemplatePreviewSize.Tablet, 0);

    it('should still scale it down rather than draw it at full size', () => geometry.scale.should.be.below(1));
});
