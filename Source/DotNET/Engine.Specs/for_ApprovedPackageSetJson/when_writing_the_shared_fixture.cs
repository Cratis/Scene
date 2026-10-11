// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Packages;

namespace Cratis.Scene.Engine.for_ApprovedPackageSetJson;

/// <summary>
/// <c language="shell">approved-package-set-fixture.json</c> is read by the TypeScript loader too, so the canonical bytes .NET writes
/// and the document React loads cannot drift apart.
/// </summary>
public class when_writing_the_shared_fixture : Specification
{
    string _fixture = null!;
    string _written = null!;

    void Establish() => _fixture = File.ReadAllText(Path.Combine(FindRepositoryRoot(), "approved-package-set-fixture.json"));

    void Because() => _written = ApprovedPackageSetJson.Write(ApprovedPackageSetJson.Read(_fixture).Set!);

    [Fact] void should_be_the_canonical_document() => _written.ShouldEqual(_fixture.ReplaceLineEndings("\n"));

    static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "Scene.slnx")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new DirectoryNotFoundException("Could not locate the repository root (Scene.slnx) above " + AppContext.BaseDirectory);
    }
}
