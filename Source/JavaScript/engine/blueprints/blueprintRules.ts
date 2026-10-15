// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The name of the package that provides the foundation layouts and templates every domain blueprint builds on. */
export const foundationPackageName = 'Cratis.Blueprint.Default';

/** The template types a domain blueprint may declare (Part B 1.2). */
export const blueprintTemplateTypes: readonly string[] = ['Shell', 'Workspace', 'Dashboard', 'List', 'Board', 'Detail', 'Form', 'Wizard', 'Dialog', 'Auth', 'State'];

/** The prefix every template category of a domain blueprint starts with; the rest is the domain. */
export const businessCategoryPrefix = 'Business / ';

/** The longest a blueprint description may be. */
export const maximumBlueprintDescriptionLength = 200;

const domainPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const thumbnailPattern = /^thumbnails\/[A-Za-z0-9][A-Za-z0-9._-]*\.(png|webp|jpg|svg)$/;

/** Whether a value is a lower-case domain slug: `crm`, `project-tracker`. */
export const isValidBlueprintDomain = (domain: string | undefined): boolean => domain !== undefined && domainPattern.test(domain);

/** Whether a value is a package-relative thumbnail path: `thumbnails/<name>.png`, `.webp`, `.jpg` or `.svg`. */
export const isValidThumbnailPath = (path: string | undefined): boolean => path !== undefined && thumbnailPattern.test(path);
