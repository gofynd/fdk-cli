import { isBrowser, isNode } from 'browser-or-node';

export const debounce = (func, wait, immediate) => {
    var timeout;

    // This is the function that is actually executed when
    // the DOM event is triggered.
    return function executedFunction() {
        // Store the context of this and any
        // parameters passed to executedFunction
        var context = this;
        var args = arguments;

        // The function to be called after
        // the debounce time has elapsed
        var later = function() {
            // null timeout to indicate the debounce ended
            timeout = null;

            // Call function now if you did not on the leading end
            if (!immediate) func.apply(context, args);
        };

        // Determine if you should call the function
        // on the leading or trail end
        var callNow = immediate && !timeout;

        // This will reset the waiting every function execution.
        // This is the step that prevents the function from
        // being executed because it will never reach the
        // inside of the previous setTimeout
        clearTimeout(timeout);

        // Restart the debounce waiting period.
        // setTimeout returns a truthy value (it differs in web vs node)
        timeout = setTimeout(later, wait);

        // Call immediately if you're dong a leading
        // end execution
        if (callNow) func.apply(context, args);
    };
};
export const detectMobileWidth = () => {
    if (isBrowser) {
        if (window && window.screen.width <= 768) {
            return true;
        } else {
            return false;
        }
    }
};
export const checkHtml = string => {
    return /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(
        string
    );
};
export const copyToClipboard = str => {
    const el = document.createElement('textarea'); // Create a <textarea> element
    el.value = str; // Set its value to the string that you want copied
    el.setAttribute('readonly', ''); // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px'; // Move outside the screen to make it invisible
    document.body.appendChild(el); // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0 // Check if there is any content selected previously
        ?
        document.getSelection().getRangeAt(0) // Store selection if found
        :
        false; // Mark as false to know no selection existed before
    el.select(); // Select the <textarea> content
    document.execCommand('copy'); // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el); // Remove the <textarea> element
    if (selected) {
        // If a selection existed before copying
        document.getSelection().removeAllRanges(); // Unselect everything on the HTML document
        document.getSelection().addRange(selected); // Restore the original selection
    }
};

