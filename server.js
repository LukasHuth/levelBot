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
app.listen(
    PORT,
    () => console.log(`Started server on port ${PORT}`)
)