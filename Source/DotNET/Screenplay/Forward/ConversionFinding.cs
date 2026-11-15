// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Screenplay.Forward;

/// <summary>
/// One thing the conversion of an application into Scene's model could not fully resolve.
/// </summary>
/// <remarks>
/// A finding is reported, never thrown. Conversion keeps going and returns everything that <em>did</em> convert, so a
/// caller sees every problem in one pass. What must not happen is a half-converted application shipping silently, which
/// is why the converter carries the finding rather than dropping the unconverted part.
/// </remarks>
/// <param name="Kind">What the finding is about.</param>
/// <param name="Subject">The name the finding is about - the behavior, sample data pack, outlet, destination or button.</param>
/// <param name="Message">A one-line explanation.</param>
public record ConversionFinding(ConversionFindingKind Kind, string Subject, string Message);
