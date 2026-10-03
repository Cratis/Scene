// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Markup that executes, loads or restyles something when it is injected or rendered unsafely. */
export const hostileHtml = [
    '<p>hi</p>',
    '<img src="x" onerror="window.__xss = 1">',
    '<img src="https://tracker.invalid/pixel.png">',
    '<img src="data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+">',
    '<a href="javascript:window.__href = 1">click</a>',
    '<a href="java&#9;script:window.__tab = 1">tab</a>',
    '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">data</a>',
    '<svg onload="window.__svg = 1"><script>window.__svgScript = 1</script></svg>',
    '<script>window.__script = 1</script>',
    '<style>body { outline: 5px solid red }</style>',
    '<iframe srcdoc="<script>parent.__iframe = 1</script>"></iframe>',
    '<p style="background:url(https://tracker.invalid/css)" onclick="window.__click = 1">styled</p>',
    '<form action="https://tracker.invalid"><input name="x"><button>go</button></form>',
].join('');

/** Strings that must appear nowhere in what is rendered from {@link hostileHtml}. */
export const forbiddenInOutput = [
    'onerror', 'onload', 'onclick', 'javascript:', 'java\tscript', '<script', '<style', '<iframe', '<svg', 'srcdoc',
    'tracker.invalid', 'data:text/html', 'data:image/svg', 'outline', '<form', '<input', '<button',
];
