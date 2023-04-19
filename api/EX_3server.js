const express = require("express");
const RSVP = require('rsvp');
const axios = require('axios');


const app = express();

app.get("/I/want/title", async (req, res, next) => {
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
});

app.listen(3030, () => {
    console.log("Server started at port 3030");
});
