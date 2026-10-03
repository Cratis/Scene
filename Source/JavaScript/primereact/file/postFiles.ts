// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Sends files to an address as a `multipart/form-data` POST.
 *
 * Cookies are sent only to the page's own origin (`credentials: 'same-origin'`), so an upload to another
 * origin the host allowed carries no credentials. A redirect fails the upload rather than being followed,
 * because following one would send the files to an address the origin policy never checked.
 *
 * @param url The address, already checked by `resolveUploadTarget`.
 * @param field The multipart field name each file is appended under.
 * @param files The files to send.
 * @param signal Cancels the request.
 * @throws When the request fails or the server does not answer with a success status.
 */
export async function postFiles(url: string, field: string, files: File[], signal: AbortSignal): Promise<void> {
    const body = new FormData();
    for (const file of files) body.append(field, file, file.name);

    const response = await fetch(url, { method: 'POST', body, credentials: 'same-origin', redirect: 'error', signal });
    if (!response.ok) throw new Error(`The server answered ${response.status}${response.statusText === '' ? '' : ` ${response.statusText}`}.`);
}
