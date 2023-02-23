// implementation taken from spec
// https://semver.org/

// numbers start high for backwards compatiblity
// in case I want to add more tags in the beginning
const LOWEST_TAG_VAL = 999
const prereleaseTags = {
    prealpha: LOWEST_TAG_VAL,
    alpha: 1_000,
    beta: 1_001,
    rc: 1_002
} as const

type PrereleaseTag = keyof typeof prereleaseTags

const isPositiveNumber = (n: number) => !Number.isNaN(n) && n > -1

export const MAX_VERSION_LENGTH = 256

export const NO_PRE_RELEASE_BUILD_SPECIFIED = -1

export const NO_PRE_RELEASE_TAG = "none"

export type SemVersionPrerelease = (
    typeof NO_PRE_RELEASE_TAG | PrereleaseTag
)

const getSemanticVersion = (version: string) => {
    if (version.length < 1 || version.length > MAX_VERSION_LENGTH) {
        return null
    }

    const versionSplit = version.split("-")
    if (versionSplit.length > 2) {
        return null
    }
    
    const versionsCore = versionSplit[0]
        .split(".")
        .filter(v => v.length > 0) as [string, string, string]
    if (versionsCore.length !== 3) {
        return null
    }

    const parsedVersions = versionsCore.map(v => parseInt(v, 10))
    const validVersionNumbers = parsedVersions
        .map(v => isPositiveNumber(v))
        .reduce((t, passed) => t && passed, true)
    if (!validVersionNumbers) {
        return null
    }
    const semver = new SemVer(
        ...parsedVersions as [number, number, number], 
        NO_PRE_RELEASE_TAG, NO_PRE_RELEASE_BUILD_SPECIFIED
    )
    if (versionSplit.length < 2) {
        return semver
    }
    
    const prereleaseAndBuild = versionSplit[1]
    const split = prereleaseAndBuild.split(".")
    if (split.length > 2 || split.length < 0) {
        return null
    }

    const prerelease = split[0]
    const tags = Object.keys(prereleaseTags)
    if (!Object.keys(prereleaseTags).includes(prerelease)) {
        return null
    } else {
        semver.preReleaseTag = prerelease as PrereleaseTag
    }

    if (split.length < 2) {
        // if no build number specified after
        // prerelease tag, default to build zero
        semver.preReleaseBuild = 0
        return semver
    }

    const build = split[1]
    const parsedBuild = parseInt(build, 10)
    if (isPositiveNumber(parsedBuild)) {
        semver.preReleaseBuild = parsedBuild
    } else if (tags.includes(build)) {
        const b = build as PrereleaseTag
        const tagVal = prereleaseTags[b]
        const tagValToBuild = Math.max(
            tagVal - LOWEST_TAG_VAL, 0
        )
        semver.preReleaseBuild = tagValToBuild
    } else {
        return null
    }

    return semver
}

const enum compare {
    equal = -1,
    current_higher = 0,
    current_lower = 1
}

export class SemVer {
    static null(): SemVer {
        return new SemVer(0, 0, 0, NO_PRE_RELEASE_TAG, NO_PRE_RELEASE_BUILD_SPECIFIED)
    }

    static fromString(version: string): SemVer | null {
        return getSemanticVersion(version)
    }

    major: number
    minor: number
    patch: number
    preReleaseTag: SemVersionPrerelease
    preReleaseBuild: number

    constructor(
        major: number, 
        minor: number,
        patch: number,
        preReleaseTag: SemVersionPrerelease,
        preReleaseBuild: number
    ) {
        this.major = major
        this.minor = minor
        this.patch = patch
        this.preReleaseTag = preReleaseTag
        this.preReleaseBuild = preReleaseBuild
    }

    isPrerelease(): boolean {
        return this.preReleaseTag !== NO_PRE_RELEASE_TAG
    }

    private compare(candidate: SemVer) {
        const {major, minor, patch, preReleaseTag, preReleaseBuild} = candidate 
        if (this.major > major) {
            return compare.current_higher
        } else if (this.major < major) {
            return compare.current_lower
        }

        if (this.minor > minor) {
            return compare.current_higher
        } else if (this.minor < minor) {
            return compare.current_lower
        }

        if (this.patch > patch) {
            return compare.current_higher
        } else if (this.patch < patch) {
            return compare.current_lower
        }

        const currentPrerelease = this.isPrerelease()
        const candidatePrerelease = candidate.isPrerelease()
        if (!currentPrerelease && !candidatePrerelease) {
            return compare.equal
        }

        if (!currentPrerelease && candidatePrerelease) {
            return compare.current_higher
        } else if (currentPrerelease && !candidatePrerelease) {
            return compare.current_lower
        }

        const preTag = prereleaseTags[this.preReleaseTag as PrereleaseTag]
        const comparePreTag = prereleaseTags[preReleaseTag as PrereleaseTag]
        if (preTag > comparePreTag) {
            return compare.current_higher
        } else if (preTag < comparePreTag) {
            return compare.current_lower
        }

        if (this.preReleaseBuild > preReleaseBuild) {
            return compare.current_higher
        } else if (this.preReleaseBuild < preReleaseBuild) {
            return compare.current_lower
        }

        return compare.equal
    }

    isGreater(candidate: SemVer): boolean {
        return this.compare(candidate) === compare.current_higher
    }

    isLower(candidate: SemVer): boolean {
        return this.compare(candidate) === compare.current_lower
    }

    isEqual(candidate: SemVer): boolean {
        return this.compare(candidate) === compare.equal
    }
}
