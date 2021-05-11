/*****************************************************************************************************************
@Author : pranayusg
@Date   : 26.08.2020
@Description: Saving of data to CSV files is done here 
@module working link : https://flaviocopes.com/node-write-csv/
*****************************************************************************************************************/
const ObjectsToCsv = require('objects-to-csv')
var Q = require('q');

var methods = {};

methods.saveMarutiSuzukiTrueValueData = function (list) {
    var defer = Q.defer();
    const csv = new ObjectsToCsv(list)
    csv.toDisk('./data/marutisuzukitruevalue.csv', { append: true })
        .then(function () {
            defer.resolve();
        })
        .catch(function (err) {
            // console.log(err)
            console.log("Error while saving data");
        });

    return defer.promise;
}

module.exports = methods;
