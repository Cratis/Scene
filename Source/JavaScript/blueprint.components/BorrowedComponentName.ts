// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Names this blueprint's templates reference that come from neither `Cratis.Components` nor itself.
 *
 * There is one, and it is worth stating why rather than leaving it as a bare string in a builder.
 *
 * `Cratis.Components`' data table and data page take their columns as children - the library's own
 * documentation says the columns arrive in the `content` slot - but the library declares no `column` name
 * of its own, because its tables are `DataTableForQuery` wrapping PrimeReact's `DataTable`, and a column
 * is PrimeReact's `Column`. So a template that wants a table with real columns has to name PrimeReact's,
 * and this blueprint's manifest declares PrimeReact as a dependency partly for that reason.
 *
 * It is checked the same way every other borrowed name in this repository is: against the owning
 * package's own manifest, by a spec, rather than assumed. The default blueprint learned that the hard way
 * when it referenced `chart` and `fileUpload`, which neither library declares.
 */
export enum BorrowedComponentName {
    /** PrimeReact's `Column` - one column of a data table, given a `field` and a `header`. */
    Column = 'column',
}
