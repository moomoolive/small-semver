declare const prereleaseTags: {
    readonly prealpha: 999;
    readonly alpha: 1000;
    readonly beta: 1001;
    readonly rc: 1002;
};
type PrereleaseTag = keyof typeof prereleaseTags;
export declare const MAX_VERSION_LENGTH = 256;
export declare const NO_PRE_RELEASE_BUILD_SPECIFIED = -1;
export declare const NO_PRE_RELEASE_TAG = "none";
export type SemVersionPrerelease = (typeof NO_PRE_RELEASE_TAG | PrereleaseTag);
export declare class SemVer {
    static null(): SemVer;
    static fromString(version: string): SemVer | null;
    major: number;
    minor: number;
    patch: number;
    preReleaseTag: SemVersionPrerelease;
    preReleaseBuild: number;
    constructor(major: number, minor: number, patch: number, preReleaseTag: SemVersionPrerelease, preReleaseBuild: number);
    isPrerelease(): boolean;
    private compare;
    isGreater(candidate: SemVer): boolean;
    isLower(candidate: SemVer): boolean;
    isEqual(candidate: SemVer): boolean;
}
export {};
//# sourceMappingURL=index.d.ts.map