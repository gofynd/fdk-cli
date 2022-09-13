'use strict';

function isSpecial(e) {
    let arr = [46, 8, 9, 27, 13, 110];
    // Allow: backspace, delete, tab, escape, enter
    if (
        arr.includes(e.keyCode) ||
        // Allow: Ctrl+A, Command+A , ctrl + v
        ((e.keyCode === 65 || e.keyCode === 86) &&
            (e.ctrlKey === true || e.metaKey === true)) ||
        // Allow: home, end, left, right, down, up
        (e.keyCode >= 35 && e.keyCode <= 40)
    ) {
        // let it happen, don't do anything
        return true;
    }
    return false;
}

function isNumberKey(e) {
    // Ensure that it is a number and stop the keypress
    if (
        (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) &&
        (e.keyCode < 96 || e.keyCode > 105)
    ) {
        return false;
    }
    return true;
}

function isFreeNavigation(e) {
    //Ensure Delete ,Backspace , arrow keys nav.
    if (
        e.keyCode == 46 ||
        e.keyCode == 8 ||
        (e.keyCode >= 37 && e.keyCode <= 40)
    ) {
        return true;
    }

    return false;
}

function isValidEmail(value) {
    value = value.trim();
    if (value.length === 0) {
        return false;
    } else {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let testEmail = re.test(String(value).toLowerCase());
        if (!testEmail) {
            return false;
        }
    }
    return true;
}

module.exports = {
    isSpecial: isSpecial,
    isNumberKey: isNumberKey,
    isFreeNavigation: isFreeNavigation,
    isValidEmail: isValidEmail
};
