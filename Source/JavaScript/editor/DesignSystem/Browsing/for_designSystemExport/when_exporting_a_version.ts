// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { exportedFiles } from '../designSystemExport';

const files = exportedFiles({ number: 3, screenplay: 'design system ProductDesign\n  modes light\n' });

describe('when exporting a version', () => {
    it('should export the screenplay alone', () => files.should.have.length(1));
    it('should name the file for the version', () => files.map(file => file.name).should.deep.equal(['design-system-v3.play']));
    it('should carry the version text unchanged', () => files.map(file => file.content).should.deep.equal(['design system ProductDesign\n  modes light\n']));
});
