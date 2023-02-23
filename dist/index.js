// implementation taken from spec
// https://semver.org/
// numbers start high for backwards compatiblity
// in case I want to add more tags in the beginning
const LOWEST_TAG_VAL = 999;
const prereleaseTags = {
    prealpha: LOWEST_TAG_VAL,
    alpha: 1_000,
    beta: 1_001,
    rc: 1_002
};
const isPositiveNumber = (n) => !Number.isNaN(n) && n > -1;
export const MAX_VERSION_LENGTH = 256;
export const NO_PRE_RELEASE_BUILD_SPECIFIED = -1;
export const NO_PRE_RELEASE_TAG = "none";
const getSemanticVersion = (version) => {
    if (version.length < 1 || version.length > MAX_VERSION_LENGTH) {
        return null;
    }
    const versionSplit = version.split("-");
    if (versionSplit.length > 2) {
        return null;
    }
    const versionsCore = versionSplit[0]
        .split(".")
        .filter(v => v.length > 0);
    if (versionsCore.length !== 3) {
        return null;
    }
    const parsedVersions = versionsCore.map(v => parseInt(v, 10));
    const validVersionNumbers = parsedVersions
        .map(v => isPositiveNumber(v))
        .reduce((t, passed) => t && passed, true);
    if (!validVersionNumbers) {
        return null;
    }
    const semver = new SemVer(...parsedVersions, NO_PRE_RELEASE_TAG, NO_PRE_RELEASE_BUILD_SPECIFIED);
    if (versionSplit.length < 2) {
        return semver;
    }
    const prereleaseAndBuild = versionSplit[1];
    const split = prereleaseAndBuild.split(".");
    if (split.length > 2 || split.length < 0) {
        return null;
    }
    const prerelease = split[0];
    const tags = Object.keys(prereleaseTags);
    if (!Object.keys(prereleaseTags).includes(prerelease)) {
        return null;
    }
    else {
        semver.preReleaseTag = prerelease;
    }
    if (split.length < 2) {
        // if no build number specified after
        // prerelease tag, default to build zero
        semver.preReleaseBuild = 0;
        return semver;
    }
    const build = split[1];
    const parsedBuild = parseInt(build, 10);
    if (isPositiveNumber(parsedBuild)) {
        semver.preReleaseBuild = parsedBuild;
    }
    else if (tags.includes(build)) {
        const b = build;
        const tagVal = prereleaseTags[b];
        const tagValToBuild = Math.max(tagVal - LOWEST_TAG_VAL, 0);
        semver.preReleaseBuild = tagValToBuild;
    }
    else {
        return null;
    }
    return semver;
};
export class SemVer {
    static null() {
        return new SemVer(0, 0, 0, NO_PRE_RELEASE_TAG, NO_PRE_RELEASE_BUILD_SPECIFIED);
    }
    static fromString(version) {
        return getSemanticVersion(version);
    }
    major;
    minor;
    patch;
    preReleaseTag;
    preReleaseBuild;
    constructor(major, minor, patch, preReleaseTag, preReleaseBuild) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
        this.preReleaseTag = preReleaseTag;
        this.preReleaseBuild = preReleaseBuild;
    }
    isPrerelease() {
        return this.preReleaseTag !== NO_PRE_RELEASE_TAG;
    }
    compare(candidate) {
        const { major, minor, patch, preReleaseTag, preReleaseBuild } = candidate;
        if (this.major > major) {
            return 0 /* compare.current_higher */;
        }
        else if (this.major < major) {
            return 1 /* compare.current_lower */;
        }
        if (this.minor > minor) {
            return 0 /* compare.current_higher */;
        }
        else if (this.minor < minor) {
            return 1 /* compare.current_lower */;
        }
        if (this.patch > patch) {
            return 0 /* compare.current_higher */;
        }
        else if (this.patch < patch) {
            return 1 /* compare.current_lower */;
        }
        const currentPrerelease = this.isPrerelease();
        const candidatePrerelease = candidate.isPrerelease();
        if (!currentPrerelease && !candidatePrerelease) {
            return -1 /* compare.equal */;
        }
        if (!currentPrerelease && candidatePrerelease) {
            return 0 /* compare.current_higher */;
        }
        else if (currentPrerelease && !candidatePrerelease) {
            return 1 /* compare.current_lower */;
        }
        const preTag = prereleaseTags[this.preReleaseTag];
        const comparePreTag = prereleaseTags[preReleaseTag];
        if (preTag > comparePreTag) {
            return 0 /* compare.current_higher */;
        }
        else if (preTag < comparePreTag) {
            return 1 /* compare.current_lower */;
        }
        if (this.preReleaseBuild > preReleaseBuild) {
            return 0 /* compare.current_higher */;
        }
        else if (this.preReleaseBuild < preReleaseBuild) {
            return 1 /* compare.current_lower */;
        }
        return -1 /* compare.equal */;
    }
    isGreater(candidate) {
        return this.compare(candidate) === 0 /* compare.current_higher */;
    }
    isLower(candidate) {
        return this.compare(candidate) === 1 /* compare.current_lower */;
    }
    isEqual(candidate) {
        return this.compare(candidate) === -1 /* compare.equal */;
    }
}
