import { isBrowser, isNode } from 'browser-or-node';

export const LocalStorageService = {
    removeItem(key) {
        if (isBrowser) {
            localStorage.removeItem(key);
        }
    },
    removeAll() {
        if (isBrowser) {
            localStorage.clear();
        }
    },
    addOrUpdateItem(key, value, ttl_ms = null) {
        if (isBrowser && value) {
            const jsonObj = addKeyProps(key, value, ttl_ms);
            let val = JSON.stringify(jsonObj);
            localStorage.setItem(key, val);
        }
    },
    getItem(key) {
        if (isBrowser) {
            let val = localStorage.getItem(key);
            if (val) {
                const jsonObj = JSON.parse(val);
                try {
                    if (isCacheStale(jsonObj)) {
                        //remove json object
                        this.removeItem(key);
                        return null;
                    }
                    return jsonObj.value;
                } catch (err) {
                    return null;
                }
            }
            return null;
        }
    }
};

export const STORAGE_KEYS = {
    TOKEN: 'm_token',
    THEME: 'm_theme',
    CURRENCY: 'm_currency',
    PREVIOUS_SEARCHES: 'm_prevSearches',
    USER_PINCODE: 'm_userPincode',
    USER_CART: 'm_usercart',
    WISHLIST_UIDS: 'm_wishlistUids',
    COMPARE_UIDS: 'm_compareUids',
    ORDERING_STORE: 'm_orderingStore',
    DEPLOYMENT_STORE: 'm_deploymentStore'
};

const STORAGE_CONFIG = {
    [STORAGE_KEYS.USER_PINCODE]: {
        // ls_ttl_ms:1000*60
    }
};

function getNow() {
    return Date.now();
}

function isCacheStale(obj) {
    if (obj.ls_ttl_ms) {
        return getNow() - (obj.ls_timestamp + obj.ls_ttl_ms) > 0;
    }
    return false;
}

function addKeyProps(key, obj, ttl_ms = null) {
    const jsonObj = { ls_timestamp: getNow(), value: obj };
    if (STORAGE_CONFIG[key]) {
        return Object.assign({}, jsonObj, STORAGE_CONFIG[key]);
    }
    //for theme , set ttl without using store config
    else if (ttl_ms) {
        return Object.assign({}, jsonObj, { ls_ttl_ms: ttl_ms });
    }
    return jsonObj;
}