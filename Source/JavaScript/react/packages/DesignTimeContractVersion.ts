// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The design-time extension contract this host implements, as `major.minor`.
 *
 * The contract is the set of extension points a package's design-time bundle fills - previews, designers,
 * property editors, property displays and actions - and the props and context each receives. A minor
 * version adds optional members; a major version changes or removes them. A host loads a package's
 * contributions only when the package's declared major version matches this one.
 */
export const DesignTimeContractVersion = '1.0';
