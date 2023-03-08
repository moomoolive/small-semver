export type PrereleaseTag = ("prealpha" | "alpha" | "beta" | "rc");
/**
 * the longest length an inputted semantic version string can be
 */
export declare const MAX_VERSION_LENGTH = 256;
export declare const NO_PRE_RELEASE_BUILD_SPECIFIED = -1;
export declare const NO_PRE_RELEASE_TAG = "none";
export type SemVersionPrerelease = (typeof NO_PRE_RELEASE_TAG | PrereleaseTag);
/**
 * Repersents a semantic version that is compliant with the
 * specification found at https://semver.org/ (the same one
 * Node uses).
 */
export declare class SemVer {
    /**
     * returns a SemVer that has all patch members set to
     * 0 (major, minor, patch) and no pre prelease tag.
     */
    static null(): SemVer;
    /**
     * Returns a Semver if string is a valid semantic
     * version string, Otherwise returns null.
     *
     * @param version a semantic version string
     * @returns
     */
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
//# sourceMappingURL=index.d.ts.map