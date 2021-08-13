const { getPlatformUrl, getGrindorUrl, getBlitzkriegUrl } = require('./apiUrl');
const axios = require('axios');
const chalk = require('chalk');
const fs = require("fs");
const path = require("path");
const mime = require('mime');
const { readCookie, getActiveContext } = require('../utils/utils');
const { logger } = require('../utils/logger');


const startThemeImagesUpload = async (data) => {
    const currentContext = getActiveContext();
    const headers = {
        'x-application-id': currentContext.appId,
        'x-application-token': currentContext.token,
        Cookie: data.Cookie || readCookie(),
    };
    const platform = getGrindorUrl(currentContext.host);
    const response = await axios.post(
        `${platform}/v1.0/company/${currentContext.company_id}/application/${currentContext.appId}/namespaces/application-theme-images/upload/start/`,
        data,
        {
            headers
        }
    );
    return response ? response.data : response;
};

const getTheme = async () => {
    const currentContext = getActiveContext();
    const headers = {
        'x-application-id': currentContext.appId,
        'x-application-token': currentContext.token,
        Cookie: readCookie()
    };
    const platform = getBlitzkriegUrl(currentContext.host);
    const response = await axios.get(
        `${platform}/theme`,
        {
            headers
        }
    );
    return response ? response.data : response;
};

const updateTheme = async (data) => {
    const currentContext = getActiveContext();
    const headers = {
        'x-application-id': currentContext.appId,
        'x-application-token': currentContext.token,
        Cookie: data.Cookie || readCookie()
    };
    const platform = getBlitzkriegUrl(currentContext.host);
    const response = await axios.put(
        `${platform}/theme`,
        data,
        {
            headers
        }
    );
    return response ? response.data : response;
};

const uploadFile = async (filepath, grindorNamespace) => {
    const currentContext = getActiveContext();
    const headers = {
        'x-application-id': currentContext.appId,
        'x-application-token': currentContext.token,
        Cookie: readCookie(),
    };

    let stats;
    // start
    try {
        stats = fs.statSync(filepath);
    } catch (err) {
        // if the file does not exist, just return
        console.log(err);
        return;
    }
    const contentType = mime.getType(path.extname(filepath));
    if (contentType === 'image/jpg') {
        contentType = 'image/jpeg';
    }
    const startData = {
        file_name: path.basename(filepath),
        content_type: contentType,
        size: stats.size,
    };

    const platform = getGrindorUrl(currentContext.host);
    const res1 = await axios.post(
        `${platform}/v1.0/company/${currentContext.company_id}/application/${currentContext.appId}/namespaces/${grindorNamespace}/upload/start`,
        startData,
        {
            headers
        }
    );
    const startResponse = res1 ? res1.data : res1;

    let s3Url = startResponse.upload.url;
    // srcCdnUrl = startResponse.cdn.url;

    //upload file to s3
    const res2 = await axios.put(
        s3Url,
        fs.readFileSync(filepath),
        {
            headers: { 'Content-type': contentType }
        }
    );
    let uploadResponse = res2 ? res2.data : res2;

    // complete
    const res3 = await axios.post(
        `${platform}/v1.0/company/${currentContext.company_id}/application/${currentContext.appId}/namespaces/${grindorNamespace}/upload/complete`,
        {
            response: startResponse,
            ...startData,
        },
        {
            headers
        }
    );
    let completeResponse = res3 ? res3.data : res3;

    return {
        start: startResponse,
        upload: uploadResponse,
        complete: completeResponse
    };
};

module.exports = {
    startThemeImagesUpload,
    getTheme,
    updateTheme,
    uploadFile
};