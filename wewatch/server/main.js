const util = require('util');
const express = require('express');
const app = require('express')();
const url = require('url');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const bcrypt = require('bcrypt');
const log = require('loglevel');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

log.setLevel("debug");

const mysql = require('mysql');

const jwtConfig = require('/home/ec2-user/config/jwt.conf');
const config = require('/home/ec2-user/config/mysql.conf');

function makeDB(config) {
        const connection = mysql.createConnection(config);
        return {
                query( sql, args ) {
                        return util.promisify( connection.query )
                        .call( connection, sql, args );
                },
                close() {
                        return util.promisify( connection.end ).call( connection );
                }
        };
}

const db = makeDB(config);

function ld(msg){
	log.debug(msg);
}
function le(msg){
	log.error(msg);
}
function li(msg){
	log.info(msg);
}

const PORT = process.env.PORT || 443;
var parser = require('ua-parser-js');
var ua = '';

app.use(cookieParser());

app.use(function (req, res, next) {
	if (req.secure) {
		ua = parser(req.headers['user-agent']);
		next();
	} else {
		res.redirect('https://wewatch.com/' + req.url);
	}
});

const httpsOptions = {
	key: fs.readFileSync(path.resolve('/home/ec2-user/config/cert.key')),
	cert: fs.readFileSync(path.resolve('/home/ec2-user/config/cert.pem'))
};

const server = https.createServer(httpsOptions, app)
	.listen(PORT, () => {
		log.info('server running at wewatch.com:' + PORT);
	});

const httpServer = http.createServer(app).listen(80,
	() => {log.info('listening!')});

app.get('/password-check', async (req, res) => {
	try{
		const urlQuery = url.parse(req.url,true).query;
		const email = urlQuery["user_email"]
		const controller_key = urlQuery["controller_key"]
		let formhash = bcrypt.hashSync(controller_key,10);
		result = await db.query(`SELECT email, controller_key_hash FROM main.users WHERE email='${email}';`);
		if (result === undefined || result.length == 0){
			log.info("User: " + email + " attempted to log in, but doesnt exist");
		} else {
			log.info(result);
			if(await bcrypt.compareSync(controller_key,result[0].controller_key_hash)){
				fs.appendFile('./logs/' + email + '-' + Date.now(),'\n', () => { let dummy = 0;});
				let query = 'SELECT GROUP_CONCAT(v.path) as Paths from videos v inner join user_videos uv on uv.video_id = v.id inner join users u on u.id = uv.user_id where u.email = "';
				query += email;
				query += '";';
				log.debug(query);
				await db.query('SET SESSION group_concat_max_len = 200000;')
				var video_list_query = await db.query(query);
				var video_list = video_list_query[0]["Paths"];
				let jResponse = {
							video_list : video_list
						}
				res.send(JSON.stringify(jResponse));
			}else{
				log.info("User: " + email + " keycheck failed");
				res.sendFile("./index.html")
			}
		}
	} catch (err){
		log.error(err);
	}
});

app.get(['/index.html','/'], (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/*', (req, res) => {
	const forbidden = ['server.js'];
	if (! forbidden.includes(req.params[0]) ){
		res.sendFile(__dirname + '/' +req.params[0]);
	}else{
		res.sendFile(__dirname + '/index.html');
	}
});
