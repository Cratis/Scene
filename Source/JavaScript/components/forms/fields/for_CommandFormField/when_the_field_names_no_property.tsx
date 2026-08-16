// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { externalComponent } from '../../../given';
import { SceneInputTextField } from '../SceneInputTextField';

describe('when the field names no property', () => {
    beforeEach(() => {
        render(<SceneInputTextField element={externalComponent('Cratis.Components:inputTextField', { title: 'Customer' })} slots={{}} />);
    });

    it('should render a placeholder rather than a field bound to nothing', () =>
        screen.getByText("Missing 'property' on Cratis.Components:inputTextField").should.exist);
});
