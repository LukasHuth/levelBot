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

app.all("/v1/user/:server/:id", (req, res, method) => {
    console.log(req.method);
    if(req.method == 'GET') {
        const { server, id } = req.params;
        var data = JSON.parse(fs.readFileSync("./userdata.json"));
        if(!data.hasOwnProperty(server+'')) data[server+''] = {};
        if(data[server+''].hasOwnProperty(id+'')) {
            data[server+''][id+'']["required"] = 100*data[id+'']["level"];
            data[server+''][id+'']["missing"] = data[id+'']['xp'];
            for(i = 1; i <= data[id+''].level-1;i++) {
                data[server+''][id+'']['missing']-=100*i;
            }
            data[server+''][id+'']["rank"] = 1;
            for(elm in data[server+'']) {
                if(elm != id+'') {
                    // console.log(elm, id+'');
                    if(data[server+''][elm]["xp"] > data[server+''][id+'']["xp"]) {
                        data[server+''][id+'']["rank"]++;
                    }
                }
            }
            index = data[server+''][id+''].indexOf("last");
            data[server+''][id+''].splice(index, 1);
            res.status(200).send(data[server+''][id+'']);
        } else {
            data[server+''][id+''] = {};
            // "level": 7,
            // "xp": 2650,
            // "missing": 150,
            // "rank": 1,
            // "required": 400
            data[server+''][id+'']["level"] = 1;
            data[server+''][id+'']["xp"] = 0;
            const last = 0;
            data[server+''][id+'']["last"] = last;
            fs.writeFileSync("./userdata.json", JSON.stringify(data));
            data[server+''][id+'']["missing"] = 100;
            data[server+''][id+'']["rank"] = -1;
            data[server+''][id+'']["required"] = 100;
            res.status(200).send(data[id+'']);
            // res.status(404).send();
        }
        return;
    }
    if(req.method == 'PUT') {
        const { server, id } = req.params;
        var data = JSON.parse(fs.readFileSync("./userdata.json"));
        var sv = JSON.parse(fs.readFileSync("./serversettings.json"));
        if(!sv.hasOwnProperty(server+'')) {
            sv[server+''] = {};
            sv[server+'']['min'] = 10;
            sv[server+'']['max'] = 15;
        }
        if(!data.hasOwnProperty(server+'')) data[server+''] = {};
        if(!data[server+''].hasOwnProperty(id+'')) {
            data[server+''][id+''] = {};
            data[server+''][id+'']["level"] = 1;
            data[server+''][id+'']["xp"] = 0;
            const last = 0;
            data[server+''][id+'']["last"] = last;
        }
        const _time = new Date()
        const time = _time.getTime();
        const tm20 = time - ((20*60)*1000);
        if(data[server+''][id+'']["last"] < tm20) {
            xp = Math.floor(Math.random()*(sv[server+'']["max"] - sv[server+'']["min"]));
            xp+=sv[server+'']["min"];
            data[server+''][id+'']["last"] = time;
            fs.writeFileSync("./userdata.json", JSON.stringify(data));
        }
    }
    res.status(400).send();
})

app.listen(
    PORT,
    () => console.log(`Started server on port ${PORT}`)
)