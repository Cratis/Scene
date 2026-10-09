// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

export interface PackageHostAssetsProps {
    assets: string[];
    fonts: string[];
}

/**
 * Emits package-declared browser assets for a package host example.
 */
export function PackageHostAssets({ assets, fonts }: PackageHostAssetsProps) {
    const fontSet = new Set(fonts);
    return <>
        {assets.filter(asset => !fontSet.has(asset)).map(asset => <link key={asset} rel='stylesheet' href={asset} data-scene-package-asset={asset} />)}
        {fonts.map(font => <link key={font} rel='preload' href={font} as='font' crossOrigin='' data-scene-package-font={font} />)}
    </>;
}
