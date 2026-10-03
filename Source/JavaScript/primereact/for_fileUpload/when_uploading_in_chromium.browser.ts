// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Page, Request } from 'playwright-core';
import { ChromiumPage, openChromiumPage } from '../for_primeReactPackage/given/a_chromium_page';
import { PageWindow, ShowOptions } from '../for_primeReactPackage/given/page_window';

const origin = 'https://app.test';
const file = (name: string, contents = 'scene') => ({ name, mimeType: 'text/plain', buffer: Buffer.from(contents) });

describe('when uploading in Chromium', () => {
    let chromium: ChromiumPage;
    let page: Page;
    let requests: Request[];

    const show = (properties: Record<string, unknown>, options: ShowOptions = {}) =>
        page.evaluate(([authored, host]) => (window as unknown as PageWindow).show('fileUpload', authored, undefined, host as ShowOptions), [properties, options] as const);
    const uploads = () => page.evaluate(() => (window as unknown as PageWindow).uploads);

    /** Drops files on the zone as a browser reports a drag from the desktop. */
    const drop = (...names: string[]) => page.evaluate(zoneFiles => {
        const transfer = new DataTransfer();
        zoneFiles.forEach(name => transfer.items.add(new File(['dropped'], name, { type: 'text/plain' })));
        document.querySelector('[role=region]')!.dispatchEvent(new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true }));
    }, names);

    /** Chooses several files in an input that does not accept them - what a script or an unusual browser does. */
    const forceSeveral = (...names: string[]) => page.evaluate(chosen => {
        const input = document.querySelector('input[type=file]') as HTMLInputElement;
        const transfer = new DataTransfer();
        chosen.forEach(name => transfer.items.add(new File(['forced'], name, { type: 'text/plain' })));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, names);

    beforeAll(async () => { chromium = await openChromiumPage({ origin }); page = chromium.page; });
    afterAll(async () => { await chromium.browser.close(); });
    beforeEach(async () => {
        requests = [];
        for (const pattern of [`${origin}/uploads`, 'http://localhost:5180/**', 'https://files.test/**']) {
            await page.route(pattern, route => {
                requests.push(route.request());
                return route.fulfill({ status: 200, body: 'ok', headers: { 'access-control-allow-origin': origin } });
            });
        }
    });
    afterEach(async () => {
        await page.evaluate(() => (window as unknown as PageWindow).hide());
        await page.unrouteAll();
        chromium.errors.should.deep.equal([]);
    });

    describe('and a host handler owns the upload', () => {
        it('should hand over the chosen file and the checked address, and send nothing itself', async () => {
            await show({ mode: 0, url: '/uploads', ariaLabel: 'Attachments' }, { handler: 'record' });
            await page.locator('input[type=file]').setInputFiles(file('scene.txt'));
            await page.getByRole('button', { name: 'Upload selected files' }).click();
            await page.getByText('1 file uploaded.').waitFor();
            (await uploads()).should.deep.equal([{ names: ['scene.txt'], url: '/uploads' }]);
            requests.should.have.lengthOf(0);
        });

        it('should request nothing when it mounts', async () => {
            await show({ mode: 'auto', url: '/uploads' });
            await page.waitForTimeout(300);
            requests.should.have.lengthOf(0);
        });

        it('should refuse several files for multiple false, from the input and from a drop, before the handler', async () => {
            await show({ mode: 'auto', multiple: false }, { handler: 'record' });
            await forceSeveral('a.txt', 'b.txt');
            await page.getByText('Only one file can be uploaded at a time.').waitFor();
            await drop('c.txt', 'd.txt');
            await page.waitForTimeout(200);
            (await uploads()).should.deep.equal([]);

            await drop('e.txt');
            await page.getByText('1 file uploaded.').waitFor();
            (await uploads()).should.deep.equal([{ names: ['e.txt'], url: undefined }]);
        });

        it('should take several files for multiple true', async () => {
            await show({ mode: 'auto', multiple: true }, { handler: 'record' });
            await page.locator('input[type=file]').setInputFiles([file('a.txt'), file('b.txt')]);
            await page.getByText('2 files uploaded.').waitFor();
            (await uploads())[0].names.should.deep.equal(['a.txt', 'b.txt']);
        });

        it('should start one upload for a double click', async () => {
            await show({ mode: 0 }, { handler: 'slow' });
            await page.locator('input[type=file]').setInputFiles(file('a.txt'));
            await page.getByRole('button', { name: 'Upload selected files' }).dblclick({ force: true });
            await page.getByText('1 file uploaded.').waitFor();
            await page.waitForTimeout(400);
            (await uploads()).should.have.lengthOf(1);
        });

        it('should show a failure of the handler and not leave an unhandled rejection', async () => {
            await show({ mode: 0 }, { handler: 'failing' });
            await page.locator('input[type=file]').setInputFiles(file('a.txt'));
            await page.getByRole('button', { name: 'Upload selected files' }).click();
            (await page.getByRole('alert').textContent())!.should.equal('Upload failed: the host refused the upload');
            await page.waitForTimeout(200);
            (await page.getByRole('button', { name: 'Upload selected files' }).isEnabled()).should.equal(true);
        });

        it('should disable every trigger and ignore a drop for a disabled element', async () => {
            await show({ mode: 0, multiple: true }, { handler: 'record', isEnabled: false });
            for (const button of await page.getByRole('button').all()) (await button.isDisabled()).should.equal(true);
            (await page.locator('input[type=file]').isDisabled()).should.equal(true);
            await drop('a.txt');
            await page.waitForTimeout(200);
            (await uploads()).should.deep.equal([]);
        });
    });

    describe('and the control posts the files itself', () => {
        it('should post to the page origin with its cookies, without following redirects', async () => {
            await chromium.context.addCookies([{ name: 'auth', value: 'secret', url: origin }]);
            await show({ mode: 0, url: '/uploads', name: 'attachment' });
            await page.locator('input[type=file]').setInputFiles(file('scene.txt', 'payload'));
            await page.getByRole('button', { name: 'Upload selected files' }).click();
            await page.getByText('1 file uploaded.').waitFor();

            requests.should.have.lengthOf(1);
            requests[0].method().should.equal('POST');
            (await requests[0].allHeaders()).cookie!.should.contain('auth=secret');
            requests[0].postData()!.should.contain('name="attachment"; filename="scene.txt"');
        });

        it('should send an allowed other origin no cookies', async () => {
            await chromium.context.addCookies([{ name: 'auth', value: 'secret', url: origin }]);
            await show({ mode: 'auto', url: 'https://files.test/up' }, { allowedOrigins: ['https://files.test'] });
            await page.locator('input[type=file]').setInputFiles(file('scene.txt'));
            await page.getByText('1 file uploaded.').waitFor();

            requests.should.have.lengthOf(1);
            ((await requests[0].allHeaders()).cookie ?? '').should.equal('');
        });

        for (const url of ['http://localhost:5180/steal', 'https://files.test/up', '//evil.test/up', 'javascript:window.__x=1', 'data:text/plain,x']) {
            it(`should refuse '${url}' by default: say so and request nothing`, async () => {
                await show({ mode: 'auto', url });
                await page.locator('input[type=file]').setInputFiles(file('a.txt'));
                await page.waitForTimeout(300);
                (await page.getByRole('alert').textContent())!.should.contain('not allowed');
                requests.should.have.lengthOf(0);
                (await page.evaluate(() => '__x' in window)).should.equal(false);
            });
        }

        it('should show a server error and keep the file for another try', async () => {
            await page.route(`${origin}/uploads`, route => route.fulfill({ status: 500, body: 'no' }));
            await show({ mode: 0, url: '/uploads' });
            await page.locator('input[type=file]').setInputFiles(file('a.txt'));
            await page.getByRole('button', { name: 'Upload selected files' }).click();
            (await page.getByRole('alert').textContent())!.should.contain('The server answered 500');
            (await page.getByRole('button', { name: 'Upload selected files' }).isEnabled()).should.equal(true);
        });

        it('should reject a file of the wrong type or size before any request', async () => {
            await show({ mode: 'auto', url: '/uploads', accept: 'image/*', maxFileSize: 4 });
            await page.locator('input[type=file]').setInputFiles(file('notes.txt'));
            await page.getByRole('alert').waitFor();
            requests.should.have.lengthOf(0);
        });
    });
});
