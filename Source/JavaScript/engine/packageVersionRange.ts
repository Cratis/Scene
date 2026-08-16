// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Checks a {@link PackageDependency.versionRange} against a package's actual version. A deliberately
 * small subset of semver — enough to express what a package declaration realistically needs, and small
 * enough that the C# twin in `Cratis.Scene.Engine` can match it exactly rather than approximately. Both
 * sides are asserted against the same shared fixture corpus.
 *
 * Supported: an empty range or `*` (anything), a bare or `=`-prefixed exact version, `^` (npm caret —
 * compatible within the leftmost non-zero component), `~` (patch-level changes), and the comparisons
 * `>=`, `>`, `<=`, `<`. Versions are read as `major.minor.patch` with any pre-release or build metadata
 * suffix ignored. Anything the parser does not recognize is treated as unsatisfiable rather than as
 * "anything", so a typo surfaces as a conflict instead of silently passing.
 */
export function isVersionSatisfiedBy(version: string, range: string | undefined): boolean {
    const trimmed = range?.trim();
    if (!trimmed || trimmed === '*') return true;

    const actual = parseVersion(version);
    if (!actual) return false;

    const [operator, literal] = splitRange(trimmed);
    const required = parseVersion(literal);
    if (!required) return false;

    switch (operator) {
        case '^':
            return compare(actual, required) >= 0 && compare(actual, caretUpperBound(required)) < 0;
        case '~':
            return compare(actual, required) >= 0 && compare(actual, [required[0], required[1] + 1, 0]) < 0;
        case '>=':
            return compare(actual, required) >= 0;
        case '>':
            return compare(actual, required) > 0;
        case '<=':
            return compare(actual, required) <= 0;
        case '<':
            return compare(actual, required) < 0;
        default:
            return compare(actual, required) === 0;
    }
}

type Version = [number, number, number];

function splitRange(range: string): [string, string] {
    for (const operator of ['>=', '<=', '^', '~', '>', '<', '=']) {
        if (range.startsWith(operator)) {
            return [operator === '=' ? '' : operator, range.substring(operator.length).trim()];
        }
    }

    return ['', range];
}

/**
 * npm's caret rule: compatibility is bounded by the leftmost non-zero component, so `^1.2.3` allows
 * anything below `2.0.0`, `^0.2.3` anything below `0.3.0`, and `^0.0.3` only `0.0.3` itself.
 */
function caretUpperBound(version: Version): Version {
    if (version[0] > 0) return [version[0] + 1, 0, 0];
    if (version[1] > 0) return [0, version[1] + 1, 0];
    return [0, 0, version[2] + 1];
}

function compare(left: Version, right: Version): number {
    if (left[0] !== right[0]) return left[0] - right[0];
    if (left[1] !== right[1]) return left[1] - right[1];
    return left[2] - right[2];
}

function parseVersion(value: string): Version | undefined {
    let numeric = value.trim();
    const suffix = numeric.search(/[-+]/);
    if (suffix >= 0) {
        numeric = numeric.substring(0, suffix);
    }

    const parts = numeric.split('.');
    if (parts.length === 0 || parts.length > 3) return undefined;

    const components: Version = [0, 0, 0];
    for (let index = 0; index < parts.length; index++) {
        if (!/^\d+$/.test(parts[index])) return undefined;
        components[index] = parseInt(parts[index], 10);
    }

    return components;
}
