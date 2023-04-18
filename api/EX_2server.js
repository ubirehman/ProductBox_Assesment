const express = require("express");
const async = require('async');

const axios = require('axios');

const app = express();

app.get("/I/want/title", async (req, res, next) => {
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

    async.each(addressArr, async (element, callback) => {
        if (!element.startsWith('http://') && !element.startsWith('https://'))
            element = 'http://' + element;

        try {
            await axios.get(element).then(response => {

                var [, , title = null] = response.data.match(/<title( [^>]*)?>(.*)<[/]title>/i) || [];
                if (!title) throw new Error(`Response contained no title`);
                else titleResults.push({ title });


                if (titleResults.length === addressArr.length) {

                    var html = '<html><head></head><body><h1> Following are the titles of given websites: </h1> <ul>';

                    for (var i = 0; i < titleResults.length; i++) {
                        html += `<li><p>${addressArr[i]} - "${titleResults[i].title}"<p></li>`;
                    }
                    html += '</ul></body></html>';

                    res.status(200).send(html);
                }
            });
        }
        catch
        {
            var html = '<html><head></head><body> <ul>';
            html += `<li><p>${element} - NO RESPONSE<p></li>`;
            res.status(404).send(html);
        }

    });

});


app.listen(3030, () => {
    console.log("Server started at pot 3030");
});
