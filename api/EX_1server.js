const express = require("express");
var http = require('http');

const app = express();

app.get("/I/want/title", (req, res, next) => {
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
            var rawData = "";
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

                    res.send(html);
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

});


app.listen(3030, () => {
    console.log("Server started at pot 3030")
});