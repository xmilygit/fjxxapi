var xlstojson = require('xls-to-json');
var crypto = require('crypto');

exports.strtomd5 = function(str) {
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
}

exports.xlstojsonfile = async function(xlsf, jsonf, sheetname="Sheet1") {
    return new Promise((resolve, reject) => {
        xlstojson({
            input: xlsf,
            output: jsonf,
            sheet: sheetname
        }, function(err, result) {
            if (err)
                reject(err)
            else
                resolve(result.length)
        })
    })
}