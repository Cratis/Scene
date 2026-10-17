// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.RegularExpressions;
using Cratis.Scene.Model.Profiles;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Resolves the identity of a profile: the name (the host's when the profile has none), the mark and its fallbacks. This is the one answer every blueprint,
/// Studio's preview, Stage and generated React draw from; the TypeScript engine has the same function, asserted against the same corpus.
/// </summary>
public static partial class ProfileIdentityResolver
{
    /// <summary>
    /// The most characters an initials logo shows.
    /// </summary>
    public const int MaximumInitials = 2;

    /// <summary>
    /// The largest image a logo can carry, in bytes of image data (not of the encoded text).
    /// </summary>
    public const int MaximumImageBytes = 400 * 1024;

    /// <summary>
    /// The closed set of icons an icon logo can use. A host draws them from its own icon set; the ids are Scene's.
    /// </summary>
    public static readonly IReadOnlyList<string> LogoIcons = ["box", "layers", "home", "users", "receipt", "package", "database", "palette"];

    /// <summary>
    /// Gets the first letter of a name, upper-cased, or <c language="csharp">A</c> when there is no name.
    /// </summary>
    /// <param name="name">The name.</param>
    /// <returns>The initial.</returns>
    public static string InitialsFromName(string name)
    {
        var first = name.Trim().EnumerateRunes().Select(rune => rune.ToString()).FirstOrDefault();
        return first is null ? "A" : first.ToUpperInvariant();
    }

    /// <summary>
    /// Resolves the identity of a profile.
    /// </summary>
    /// <param name="profile">The profile.</param>
    /// <param name="hostName">The application name of the host, used when the profile gives none.</param>
    /// <returns>The resolved identity with a diagnostic for everything that was refused.</returns>
    public static ResolvedProfileIdentity Resolve(UiProfile profile, string hostName = "")
    {
        var identity = profile.Identity;
        var logo = identity?.Logo;
        var diagnostics = new List<ProfileIdentityDiagnostic>();
        var name = string.IsNullOrWhiteSpace(identity?.Name) ? hostName.Trim() : identity.Name.Trim();

        var initials = (logo?.Initials ?? string.Empty).Trim();
        if (initials.EnumerateRunes().Count() > MaximumInitials)
        {
            diagnostics.Add(new(ProfileIdentityDiagnosticCode.InitialsTooLong, $"The initials '{initials}' are longer than {MaximumInitials} characters. Use at most {MaximumInitials}."));
            initials = string.Empty;
        }

        initials = initials.Length == 0 ? InitialsFromName(name) : initials;

        var showName = identity?.ShowName ?? true;
        var resolved = new ResolvedProfileIdentity(name, showName, LogoKind.Initials, initials, null, null, false, diagnostics);

        switch (logo?.Kind ?? LogoKind.Initials)
        {
            case LogoKind.Icon:
                if (string.IsNullOrEmpty(logo?.Icon))
                {
                    return resolved;
                }

                if (!LogoIcons.Contains(logo.Icon))
                {
                    diagnostics.Add(new(ProfileIdentityDiagnosticCode.IconUnknown, $"The icon '{logo.Icon}' is not one of the logo icons: {string.Join(", ", LogoIcons)}."));
                    return resolved;
                }

                return resolved with { Kind = LogoKind.Icon, Icon = logo.Icon };

            case LogoKind.Image:
                var image = logo?.Image ?? string.Empty;
                if (image.Length == 0)
                {
                    return resolved with { Kind = LogoKind.Image, ImageMissing = true };
                }

                var match = ImagePattern().Match(image);
                var size = match.Success ? DecodedSize(match.Groups["data"].Value) : -1;
                if (size < 0)
                {
                    diagnostics.Add(new(ProfileIdentityDiagnosticCode.ImageUnsupported, "The logo image must be a PNG, JPG, SVG or WebP, stored as a base64 data URI."));
                    return resolved with { Kind = LogoKind.Image, ImageMissing = true };
                }

                if (size > MaximumImageBytes)
                {
                    var kilobytes = ((size + 1023) / 1024).ToString(CultureInfo.InvariantCulture);
                    diagnostics.Add(new(ProfileIdentityDiagnosticCode.ImageTooLarge, $"The logo image is {kilobytes} KB. The limit is {MaximumImageBytes / 1024} KB."));
                    return resolved with { Kind = LogoKind.Image, ImageMissing = true };
                }

                return resolved with { Kind = LogoKind.Image, Image = image };

            default:
                return resolved;
        }
    }

    static int DecodedSize(string base64)
    {
        if (base64.Length % 4 != 0)
        {
            return -1;
        }

        var padding = base64.EndsWith("==", StringComparison.Ordinal) ? 2 : base64.EndsWith('=') ? 1 : 0;
        return (base64.Length / 4 * 3) - padding;
    }

    [GeneratedRegex(@"^data:image/(?:png|jpeg|jpg|svg\+xml|webp);base64,(?<data>[A-Za-z0-9+/]*={0,2})$", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex ImagePattern();
}
