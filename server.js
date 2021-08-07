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
202: Accepted
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
    // console.log(req.method);
    if(req.method == 'GET') {
        const { server, id } = req.params;
        var data = JSON.parse(fs.readFileSync("./userdata.json"));
        if(!data.hasOwnProperty(server+'')) data[server+''] = {};
        if(data[server+''].hasOwnProperty(id+'')) {
            data[server+''][id+'']["required"] = 100*data[server+''][id+'']["level"];
            data[server+''][id+'']["missing"] = data[server+''][id+'']['xp'];
            for(i = 1; i <= data[server+''][id+''].level-1;i++) {
                data[server+''][id+'']['missing']-=100*i;
            }
            data[server+''][id+'']['missing'] = data[server+''][id+'']['required']-data[server+''][id+'']['missing']
            data[server+''][id+'']["rank"] = 1;
            for(elm in data[server+'']) {
                if(elm != id+'') {
                    // console.log(elm, id+'');
                    if(data[server+''][elm]["xp"] > data[server+''][id+'']["xp"]) {
                        data[server+''][id+'']["rank"]++;
                    }
                }
            }
            delete data[server+''][id+'']["last"];
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
            res.status(200).send(data[server+''][id+'']);
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
            fs.writeFileSync("./serversettings.json", JSON.stringify(sv));
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
        // const tm20 = time - ((60)*1000);
        const tm20 = time - ((1)*1000);
        if(data[server+''][id+'']["last"] < tm20) {
            xp = Math.floor(Math.random()*(sv[server+'']["max"] - sv[server+'']["min"]));
            xp+=sv[server+'']["min"];
            data[server+''][id+'']["last"] = time;
            data[server+''][id+'']["xp"] += xp;
            missing = data[server+''][id+'']['xp'];
            for(i = 1; i <= data[server+''][id+''].level-1;i++) {
                missing-=100*i;
            }
            missing = (data[server+''][id+'']['level']*100)-missing;
            if(missing <= 0) data[server+''][id+'']['level']++;
            fs.writeFileSync("./userdata.json", JSON.stringify(data));
            if(missing <= 0) {
                res.status(202).send({level: data[server+''][id+'']['level']});
                return;
            }
            res.status(200).send();
            return;
        }
        res.status(200).send();
    }
    res.status(400).send();
})

app.listen(
    PORT,
    () => console.log(`Started server on port ${PORT}`)
)