const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 8001;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

/*
Status Codes:
200: OK
201: Created
204: Existing
400: Bad Reqest
401: Unauthorized
403: Forbidden
404: Not Found
405: Method Not Allowed
409: Conflict
500: Internal Server Error
503: Service Unavailable
*/

// start Server

app.all("/v1/user/:id", (req, res, method) => {
    console.log(req.method);
    if(req.method == 'GET') {
        const { id } = req.params;
        var data = JSON.parse(fs.readFileSync("./userdata.json"));
        if(data.hasOwnProperty(id+'')) {
            data[id+'']["required"] = 100*data[id+'']["level"];
            data[id+'']["missing"] = data[id+'']['xp'];
            for(i = 1; i <= data[id+''].level-1;i++) {
                data[id+'']['missing']-=100*i;
            }
            data[id+'']["rank"] = 1;
            for(elm in data) {
                if(elm != id+'') {
                    // console.log(elm, id+'');
                    if(data[elm]["xp"] > data[id+'']["xp"]) {
                        data[id+'']["rank"]++;
                    }
                }
            }
            res.status(200).send(data[id+'']);
        } else {
            data[id+''] = {};
            // "level": 7,
            // "xp": 2650,
            // "missing": 150,
            // "rank": 1,
            // "required": 400
            data[id+'']["level"] = 1;
            data[id+'']["xp"] = 0;
            fs.writeFileSync("./userdata.json", JSON.stringify(data));
            data[id+'']["missing"] = 100;
            data[id+'']["rank"] = -1;
            data[id+'']["required"] = 100;
            res.status(200).send(data[id+'']);
            // res.status(404).send();
        }
        return;
    }
    res.status(400).send();
})

app.listen(
    PORT,
    () => console.log(`Started server on port ${PORT}`)
)