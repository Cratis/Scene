// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { loadQuill } from '@cratis/scene.primereact/quill';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createScreenEditorEnvironment } from '../createScreenEditorEnvironment';

const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'host', packages: blueprintPreviewBundles.map(bundle => bundle.manifest.name) } as never);

describe('when a host lends nothing for the native controls', () => {
    const environment = createScreenEditorEnvironment({ runtime });

    it('should hand the rich text control Scene\'s own Quill loader', () => environment.richText!.should.equal(loadQuill));
    it('should leave the file upload to post to the address its author configured', () => (environment.fileUpload === undefined).should.be.true);
});

describe('when a host supplies its own Quill loader', () => {
    const loader = () => Promise.reject(new Error('not loaded'));

    it('should use that loader', () => createScreenEditorEnvironment({ runtime, richText: loader }).richText!.should.equal(loader));
});

describe('when a host leaves rich text out', () => {
    it('should lend no loader, so the control says it is not available', () => (createScreenEditorEnvironment({ runtime, richText: false }).richText === undefined).should.be.true);
});

describe('when a host owns the upload and names the origins it allows', () => {
    const handler = async () => undefined;
    const environment = createScreenEditorEnvironment({ runtime, fileUpload: { handler, allowedOrigins: ['https://files.example.com'] } });

    it('should pass the handler on untouched', () => environment.fileUpload!.handler!.should.equal(handler));
    it('should pass the allowed origins on untouched', () => environment.fileUpload!.allowedOrigins!.should.deep.equal(['https://files.example.com']));
});

describe('when a host lends a design-time command registrar', () => {
    const registerDesignTimeCommands = () => () => undefined;
    const environment = createScreenEditorEnvironment({ runtime, registerDesignTimeCommands });

    it('should pass the registrar on untouched', () => environment.registerDesignTimeCommands!.should.equal(registerDesignTimeCommands));
});

describe('when a host lends no design-time command registrar', () => {
    const environment = createScreenEditorEnvironment({ runtime });

    it('should leave command registration to the host', () => (environment.registerDesignTimeCommands === undefined).should.be.true);
});
