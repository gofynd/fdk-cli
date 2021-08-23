module.exports = {
    normalizeError: (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            let { data, status } = error.response;
            let obj;
            // if it is primitive
            if (data !== Object(data)) {
                obj = { message: data, code: status };
            } else {
                obj = { ...data, message: data.message, code: status }
            }
            return obj;
        } else if (error.message) {
            // Something happened in setting up the request that triggered an Error
            return { message: error.message }
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            return { message: 'no response was received' };
        } 
    }
};


// module.exports = {
//     normalizeAxiosError: (error) => {
//         if (error.response) {
//             // The request was made and the server responded with a status code
//             // that falls out of the range of 2xx
//             console.log(`error.response.data = ${error.response.data}`);
//             return error.response.data;
//         } else if (error.request) {
//             // The request was made but no response was received
//             // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
//             // http.ClientRequest in node.js
//             return { message: 'no response was received' };
//         } else {
//             // Something happened in setting up the request that triggered an Error
//             return { message: error.message }
//         }
//     },
//     normalizeError: (err) => {
//         return {
//             message: err.errors || err.message || String(err),
//             stack: err.stack
//         }
//     }
// };
