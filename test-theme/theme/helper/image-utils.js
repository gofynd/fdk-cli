export const ORIGINAL = "ORIGINAL";
export const THUMB = "thumb";

const IMAGE_SIZES = ["270x0", "540x0", "720x0"];
const IMAGE_TYPE_MAPPING = {
    [ORIGINAL]: "original",
    [THUMB]: "50x0",
};

export function getImageURL(type, originalUrl) {
    let retURL = originalUrl;
    let regexExp = "";
    for (let i = 0; i < IMAGE_SIZES.length; i++) {
        let regexstr = `\\/${IMAGE_SIZES[i]}\\/`;
        regexExp = new RegExp(regexstr, "g");
        if (regexExp.test(retURL)) {
            retURL = retURL.replace(regexExp, `/${IMAGE_TYPE_MAPPING[type]}/`);
        }
    }
    return retURL;
}