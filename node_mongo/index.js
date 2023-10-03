const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var express = require('express');
var app = express();
exports.app = app;
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
exports.urlencodedParser = urlencodedParser;
app.use(express.static('public'));
var fs = require("fs");
var manu_html_templ = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" type="text/css" href="../css/stil.css" />
</head>
<body>
<div class="navbar">
  <a href="../">Početna</a>
  <a href="../mongotest/list">Podaci iz MongoDB</a>
  <a href="../mongotest/insert">Dodavanje u MongoDB</a>
  <a href="../mongotest/remove">Izbacivanje iz MongoDB</a>
</div>`;
exports.manu_html_templ = manu_html_templ;
var footer_html_templ = `<div class="footer">prof dr Goran Šimić, 2023</div></body></html>`;
exports.footer_html_templ = footer_html_templ;
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});
app.get('/mongotest/list', async function (req, res) {
	const uriLocal = "mongodb://127.0.0.1:27017/?retryWrites=true&w=majority";
	let mongoClient;
	let htmlstr = manu_html_templ;
	htmlstr = htmlstr + `<div class="main"><h1>IS ZAPOSLENI </h1><p>Spisak zaposlenih</p>`;
	htmlstr = htmlstr + `<table border = "1"><tr><th>Ime</th><th>profesija</th></tr></p>`;
	try {
		mongoClient = new MongoClient(uriLocal, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		console.log('Connecting to MongoDB ...');
		mongoClient.connect();
		console.log('Successfully connected to MongoDB !');
		const db = mongoClient.db('internetprog');
		const kol = await db.collection("zaposleni3");
		let azaps = kol.find({}).toArray();
		(await azaps).forEach(function (zap) {
			console.log(zap.ime + " " + zap.profesija);
			htmlstr = htmlstr + `<tr><td>` + zap.ime + `</td><td>` + zap.profesija + `</td></tr>`;
		});
		mongoClient.close();
		htmlstr = htmlstr + `</table>`;
		htmlstr = htmlstr + `</div>`;
		htmlstr = htmlstr + footer_html_templ;
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.end(htmlstr);
	} catch (error) {
		console.error('Connection to MongoDB Atlas failed!', error);
		process.exit();
	}
});
app.get('/mongotest/remove', async function (req, res) {
	const uriLocal = "mongodb://127.0.0.1:27017/?retryWrites=true&w=majority";
	let mongoClient;
	let htmlstr = manu_html_templ;
	htmlstr = htmlstr + `<div class="main"><h1>IS ZAPOSLENI </h1><p>Spisak zaposlenih</p>`;
	htmlstr = htmlstr + `<table border = "1"><tr><th>Ime</th><th>Profesija</th><th>Akcija</th></tr></p>`;
	try {
		mongoClient = new MongoClient(uriLocal, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		console.log('Connecting to MongoDB ...');
		mongoClient.connect();
		console.log('Successfully connected to MongoDB !');
		const db = mongoClient.db('internetprog');
		const kol = await db.collection("zaposleni3");
		let azaps = kol.find({}).toArray();
		(await azaps).forEach(function (zap) {
			console.log(zap.ime + " " + zap.profesija);
			htmlstr = htmlstr + `<tr><td>` + zap.ime + `</td><td>` + zap.profesija 
			+ `</td><td><a href = \"./remove2/?korid=` +zap._id+ `">Ukloni</a></td></tr>`;
		});
		mongoClient.close();
		htmlstr = htmlstr + `</table>`;
		htmlstr = htmlstr + `</div>`;
		htmlstr = htmlstr + footer_html_templ;
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.end(htmlstr);
	} catch (error) {
		console.error('Connection to MongoDB Atlas failed!', error);
		process.exit();
	}
});
app.get('/mongotest/remove2/', async function (req, res) {
	let korid = req.query.korid;
	const uriLocal = "mongodb://127.0.0.1:27017/?retryWrites=true&w=majority";
	let mongoClient;
	let htmlstr = manu_html_templ;
	try {
		mongoClient = new MongoClient(uriLocal, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		console.log('Connecting to MongoDB ...');
		mongoClient.connect();
		console.log('Successfully connected to MongoDB !');
		const db = mongoClient.db('internetprog');
		const kol = await db.collection("zaposleni3");
		await kol.deleteOne({"_id": new ObjectId(korid)});
		res.redirect("/mongotest/remove");
	} catch (error) {
		console.error('DeleteOne failed!', error);
		process.exit();
	}
});
app.get('/mongotest/insert', async function (req, res) {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.sendFile(__dirname + '/regform2.html');
});
app.post('/mongotest/insert', urlencodedParser, async function (req, res) {
	const uriLocal = "mongodb://127.0.0.1:27017/?retryWrites=true&w=majority";
	let mongoClient;
	try {
		mongoClient = new MongoClient(uriLocal, {
			serverApi: {
				version: ServerApiVersion.v1,
				strict: true,
				deprecationErrors: true,
			}
		});
		console.log('Connecting to MongoDB ...');
		mongoClient.connect();
		console.log('Successfully connected to MongoDB !');
		const db = mongoClient.db('internetprog');
		const kol = await db.collection("zaposleni3");
		const doc = {
			ime: req.body.ime,
			lozinka: req.body.lozinka,
			profesija: req.body.prof,
			id: 0
		};
		const rezultat = await kol.insertOne(doc);
		mongoClient.close();
		res.setHeader('Content-Type', 'text/html; charset=utf-8');
		res.redirect("/mongotest/list");
	} catch (error) {
		console.error('Insert to MongoDB failed!', error);
		process.exit();
	}
});
var server = app.listen(8082, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Аpp listening at http://%s:%s", host, port)
});

