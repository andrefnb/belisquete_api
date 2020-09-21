
const { no_data } = require('./errors')

exports.queryErrorHandling = queryErrorHandling = (error, lang = 'en') => {
    switch(error.message) {
        case 'No data returned from the query.': return new Error(no_data.message[lang]);
        default: return error
    }
}