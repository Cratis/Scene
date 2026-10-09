// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { TemplateScope } from '@cratis/scene.model';
import { businessGallery } from '../gallery/businessGallery';
import { GalleryScreenPreview } from '../gallery/GalleryScreenPreview';

describe('when rendering gallery examples', () => {
    it('should expose categorized slice templates', () => {
        const categories = businessGallery(TemplateScope.Slice);

        categories.map(category => category.category).should.contain('Business / Master detail');
        categories.flatMap(category => category.templates.map(template => template.name)).should.contain('DataListWithDetailPage');
    });

    it('should render recursive template composition through the package host', () => {
        const rendered = render(<GalleryScreenPreview screenName='CommandSliceSection' />);

        Boolean(rendered.container.querySelector('[data-scene-host-blocked="false"]')).should.equal(true);
        (screen.queryByRole('alert') === null).should.equal(true);
    });
});
