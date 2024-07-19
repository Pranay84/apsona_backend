const express = require('express')
const app = express()
const db = require('./db')
const cors = require('cors')
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

app.use(bodyParser.json());
app.use(express.json())

app.listen(3002, () => {
    console.log('Backend is running at port 3002')
})

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

app.get('/createTable', async(req, res) => {
    const data = await db.query(`
        CREATE TABLE userInfo (
        username varchar(225),
        password varchar(225)
        )`
    )
    console.log(1)
})

const AuthorizationToken = (request, response, next) => {
    let jwtToken;
    const authHeader = request.headers["authorization"];
    // console.log(authHeader)
    if (authHeader !== undefined) {
      jwtToken = authHeader.split(" ")[2];
    }
    if (jwtToken === undefined) {
      response.status(401);
      response.send("Invalid JWT Token");
    } else {
      jwt.verify(jwtToken, "MY_SECRET_TOKEN", async (error, payload) => {
        if (error) {
          response.status(401);
          response.send("Invalid JWT Token");
        } else {
          request.username = payload.username;
          next();
        }
      });
    }
}

app.get('/getData', AuthorizationToken, async(req, res) => {
    const authHeader = req.headers["authorization"];
    const email = authHeader.split(' ')[1]
    console.log(email)
    const request = await db.query(`select * from userInfo where email = '${email}';`)
    if (request.rowCount === 1){
        res.send(request.rows[0])
    }

    db.end
})

app.post('/register', cors(corsOptions), async (req, res) => {
    const {email, username, password, number} = req.body
    const checkUser = await db.query(`select * from userInfo where email = '${email}'`)
    if (checkUser.rowCount === 1){
        res.send('User already Exists')
    }else{
        const hashedPassword = await bcrypt.hash(password, 10)
        const request = await db.query(`INSERT INTO userInfo (email, username, password, phone) VALUES('${email}', '${username}','${hashedPassword}', '${number}');`)
        if (request.rowCount === 1){
            res.send('User Added')
        }
    }
})

app.post('/login', cors(corsOptions), async(req, res) => {
    const {email, pass} = req.body
    const request = await db.query(`select * from userInfo where email = '${email}'`)
    console.log(request.rows)
    if (request.rowCount === 1){
        const {password} = request.rows[0]
        console.log(password)
        const passVerify = await bcrypt.compare(pass, password)
        if (passVerify === true){
            const payload = {
                userEmail: email,
            }

            const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN')
            console.log(jwtToken)
            res.send({jwtToken})
        }
    }else{
        res.send('User not exists')
    }
})

app.get('/message', async (req, res) => {
    res.send("Hello")
})