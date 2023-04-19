var http = require('http');
const async = require('async');
const axios = require('axios');
const RSVP = require('rsvp');


exports.SolveTaskOne = (req, res, next) => {
    const address = req.query.address;

    if (address.length < 1 || !address) {
        res.status(400).json("No address query exist");
        return;
    }


    var addressArr = [];
    if (Array.isArray(address)) {
        addressArr = address;
    } else {
        addressArr = [address];
    }


    console.log(addressArr.length);
    var rawData = "";
    var titleResults = [];

    addressArr.forEach(element => {


        if (!element.startsWith('http://') && !element.startsWith('https://'))
            element = 'http://' + element;

        const webRequest = http.get(element, (response) => {
            rawData = "";
            response.on('data', (chunk) => {
                rawData += chunk;
            });

            response.on('end', () => {

                var [, , title = null] = rawData.match(/<title( [^>]*)?>(.*)<[/]title>/i) || [];
                if (!title) throw new Error(`Response contained no title`);
                else titleResults.push({ title });

                if (titleResults.length === addressArr.length) {

                    var html = '<html><head></head><body><h1> Following are the titles of given websites: </h1> <ul>';

                    titleResults.forEach(result => {
                        html += `<li><p>${addressArr} - "${result.title}"<p></li>`;
                    });
                    html += '</ul></body></html>';

                    res.status(200).send(html);
                }

                console.log("PageLoaded");
            });
        })
            .on("error", (err) => {
                var html = '<html><head></head><body> <ul>';
                html += `<li><p>${address} - NO RESPONSE<p></li>`;
                res.status(404).send(html);
            });
    });

};



exports.SolveTaskSecondAsync = async (req, res, next) => {
    const address = req.query.address;

    if (address.length < 1 || !address) {
        res.status(400).json("No address query exist");
        return;
    }

    var addressArr = [];
    if (Array.isArray(address)) {
        addressArr = address;
    } else {
        addressArr = [address];
    }

    var titleResults = [];
    var titlePromises = [];

    async.each(addressArr, async (element, callback) => {
        if (!element.startsWith('http://') && !element.startsWith('https://'))
            element = 'http://' + element;

        const request = axios.get(element).then(response => {
            var [, , title = null] = response.data.match(/<title( [^>]*)?>(.*)<[/]title>/i) || [];
            if (!title) throw new Error(`Response contained no title`);
            else titleResults.push({ title });
        })
            .catch(error => {
                gotAnError = true;
                var html = '<html><head></head><body> <ul>';
                html += `<li><p>${element} - NO RESPONSE<p></li>`;
                res.status(404).send(html);
            });

        titlePromises.push(request);
        callback();

    }, async () => {
        try {
            await Promise.all(titlePromises);

            var html = '<html><head></head><body><h1> Following are the titles of given websites: </h1> <ul>';

            for (var i = 0; i < titleResults.length; i++) {
                html += `<li><p>${addressArr[i]} - "${titleResults[i].title}"<p></li>`;
            }
            html += '</ul></body></html>';
            console.log(addressArr.length + " " + titleResults.length);
            res.status(200).send(html);
        }
        catch (err) { }
    });


};


exports.SolveTaskThirdPromises = async (req, res, next) => {
    const address = req.query.address;

    if (address.length < 1 || !address) {
        res.status(400).json("No address query exists");
        return;
    }

    var addressArr = [];
    if (Array.isArray(address)) {
        addressArr = address;
    } else {
        addressArr = [address];
    }

    console.log(addressArr);
    var titleResults = [];

    const promises = addressArr.map((element) => {
        return new RSVP.Promise(async (resolve, reject) => {
            if (!element.startsWith('http://') && !element.startsWith('https://'))
                element = 'http://' + element;

            await axios.get(element)
                .then(response => {

                    var [, , title = null] = response.data.match(/<title( [^>]*)?>(.*)<[/]title>/i) || [];
                    if (!title) throw new Error(`Response contained no title`);
                    else titleResults.push({ title });

                    console.log("Page Loaded");
                    resolve();
                }).catch(error => {
                    var html = '<html><head></head><body> <ul>';
                    html += `<li><p>${element} - NO RESPONSE<p></li>`;
                    res.status(404).send(html);

                    reject(error);
                })
        });
    });

    RSVP.Promise.all(promises)
        .then(() => {
            var html = '<html><head></head><body><h1> Following are the titles of given websites: </h1> <ul>';

            for (var i = 0; i < titleResults.length; i++) {
                html += `<li><p>${addressArr[i]} - "${titleResults[i].title}"<p></li>`;
            }
            html += '</ul></body></html>';

            res.status(200).send(html);
        })
        .catch((err) => {
            console.error(err);
        });
};
