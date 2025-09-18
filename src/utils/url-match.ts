// url이 매치 되는지 판별하는 함수
export const match = (
    fromUrl: string,
    targetUrl: string | string[]
): boolean => {
    if (Array.isArray(targetUrl))
        return targetUrl.some((url) => match(fromUrl, url));

    const fromSegments = fromUrl
        .split("/")
        .filter((segment) => segment.length > 0);
    const targetSegments = targetUrl
        .split("/")
        .filter((segment) => segment.length > 0);

    if (fromSegments.length !== targetSegments.length) {
        return false;
    }

    for (let i = 0; i < targetSegments.length; i++) {
        const targetSegment = targetSegments[i];
        const fromSegment = fromSegments[i];

        if (/^\[.*\]$/.test(targetSegment)) {
            continue;
        }

        if (targetSegment.startsWith("regex:")) {
            const pattern = targetSegment.slice(6);
            const regex = new RegExp(pattern);

            if (!regex.test(fromSegment)) {
                return false;
            }
        } else {
            if (targetSegment !== fromSegment) {
                return false;
            }
        }
    }

    return true;
};
