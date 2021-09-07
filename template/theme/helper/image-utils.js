export const ORIGINAL = "ORIGINAL";
export const THUMB = "thumb";

const HUFFER_IMAGE_SIZES = [
    "original",
    "30x0",
    "44x0",
    "66x0",
    "50x0",
    "75x0",
    "60x60",
    "90x90",
    "100x0",
    "135x0",
    "270x0",
    "360x0",
    "500x0",
    "400x0",
    "540x0",
    "720x0",
    "312x480",
];

const IMAGE_SOURCE_TYPES = {
    HUFFER: "huffer",
    CLOUDINARY: "cloudinary",
};
const HUFFER_TYPES = {
    width: "w",
    height: "h",
};
const IMAGE_SIZES = ["270x0", "540x0", "720x0"];
const IMAGE_TYPE_MAPPING = {
    [ORIGINAL]: "original",
    [THUMB]: "50x0",
};
export const getBaseImageSourceType = (imageURL) => {
    let hostName = new URL(imageURL).hostname;
    if (hostName === "res.cloudinary.com") {
        return IMAGE_SOURCE_TYPES.CLOUDINARY;
    }
    return IMAGE_SOURCE_TYPES.HUFFER;
};
export function getImageTransformedURL(imageURL, options) {
    if (imageURL) {
        let baseImageType = getBaseImageSourceType(imageURL);
        switch (baseImageType) {
            case IMAGE_SOURCE_TYPES.HUFFER:
                return generateOptimizedHufferUrl(imageURL, options);
            case IMAGE_SOURCE_TYPES.CLOUDINARY:
                return imageURL;
        }
    }
    return imageURL;
}
const generateOptimizedHufferUrl = (imageURL, options = {}) => {
    let changeStr = "";
    let res = imageURL;
    for (let key in options) {
        changeStr += `${HUFFER_TYPES[key]}:${options[key]},`;
    }
    changeStr = "resize-" + changeStr;
    for (let i = 0; i < HUFFER_IMAGE_SIZES.length; i++) {
        let regexExp = new RegExp(HUFFER_IMAGE_SIZES[i], "g");
        let flag = regexExp.test(imageURL);
        if (flag) {
            res = imageURL.replace(regexExp, changeStr);
            return res;
        }
    }
    return res;
};

export const generateHufferOpsUrl = (imageURL, opsRegex) => {
    let res = imageURL;
    for (let i = 0; i < HUFFER_IMAGE_SIZES.length; i++) {
        let regexExp = new RegExp(HUFFER_IMAGE_SIZES[i], "g");
        let flag = regexExp.test(imageURL);
        if (flag) {
            res = imageURL.replace(regexExp, opsRegex);
            return res;
        }
    }
    return res;
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