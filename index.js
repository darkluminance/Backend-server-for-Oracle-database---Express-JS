/* 
Raiyan Abrar
28th May, 2021, 9.46PM
*/

const express = require('express'); //Import express JS library
const app = express();
const oracledb = require('oracledb'); //Import oracle library
const port = 5000; //Set backend server port number
const cors = require('cors'); //CORS allows requests from browser to be allowed

//The credentials for oracle database
const dbconnection = {
	user: 'ryoko',
	password: 'ryoko',
	connectString: 'localhost/xe',
};

//This is required for getting past the 'access blocked by cors' error
app.use(cors());

//Will convert all coming data into JSON
app.use(express.json());
//
//
//
//
//
//Get user data	-------> req is the request, res is the response we'll send back to the browser and uid is the userid whose
//data we'll search
async function getUserData(req, res, uid) {
	//Oracle query for getting data from userr table
	const query = `SELECT u_id,Name_Fname,Name_Lname,Phone_No,TO_DATE(dob), TRUNC(TO_NUMBER(SYSDATE - TO_DATE(dob)) / 365.25) AS AGE, user_typ,user_name FROM Userr WHERE u_id = '${uid}'`;
	// console.log(query);

	try {
		//Try to perform a connection to the oracle database using the credentials above
		connection = await oracledb.getConnection(dbconnection);

		//Executes the query and stores the obtained data
		result = await connection.execute(query);

		console.log('Connected');
	} catch (error) {
		//If any error occurs while connecting or fetching data
	} finally {
		if (connection) {
			await connection.close(); //Closes the connection
			console.log('Connection ended');
		}
		res.status(200).send(result.rows); //Sends back the data with success status 200
	}
}
//
//
//
//Get user id 	-------> req is the request, res is the response we'll send back to the browser, un is the username
async function getUserID(req, res, un) {
	const query = `SELECT u_id FROM Userr WHERE user_name = '${un}'`;
	// console.log(query);

	try {
		connection = await oracledb.getConnection(dbconnection);

		result = await connection.execute(query);

		//if (result.rows[0] == null) throw 'Data not found';

		console.log('Connected');
	} catch (error) {
		// res.status(404).send('Error occurred! ' + error.message);
	} finally {
		if (connection) {
			await connection.close();
			console.log('Connection ended');
		}
		res.status(200).send(result.rows[0]);
	}
}
//
//
//
//Insert new User data into the database
async function sendUserData(req, res, data) {
	const query = `insert into userr (u_id,admin_id,Name_Fname,Name_Lname,dob,Phone_No, user_name) values ('${data[0]}','${data[1]}','${data[2]}','${data[3]}',to_date('${data[4]}','dd-mon-yyyy'),'${data[5]}', '${data[6]}')`;

	try {
		connection = await oracledb.getConnection(dbconnection);

		result = await connection.execute(query, {}, { autoCommit: true });

		console.log('Connected');
	} catch (error) {
	} finally {
		if (connection) {
			await connection.close();
			console.log('Connection ended');
		}
		res.status(200).send(result);
	}
}
//
//
//
//Update user's current location
async function updateUserLocation(req, res, data) {
	let query = '';

	//Set query based on user types
	if (data[1] === 'C') {
		query = `
				UPDATE clientt
				SET C_Location_X = ${data[2]},
						C_Location_Y = ${data[3]}
				WHERE u_id = '${data[0]}'
		`;
	} else if (data[1] === 'D') {
		query = `
			UPDATE driver
			SET DR_Location_X = ${data[2]},
					DR_Location_Y = ${data[3]}
			WHERE u_id = '${data[0]}'
	`;
	}

	try {
		connection = await oracledb.getConnection(dbconnection);

		result = await connection.execute(query, {}, { autoCommit: true });

		// console.log('Connected');
	} catch (error) {
	} finally {
		if (connection) {
			await connection.close();
			// console.log('Connection ended');
		}
		res.status(200).send(result);
	}
}
//
//
//
//Send list of drivers within the range
// 	-------> req is the request, res is the response we'll send back to the browser
// ----> lat and lng are the lattitude and longitude of the current location of the user
async function getDriversWithinRange(req, res, lat, lng) {
	const query = `Select D.U_ID, D.Dr_Location_X, D.Dr_Location_Y
	From driver D 
	Where 3963.0 * acos((sin(${lng}/ 57.29577951) * sin(D.Dr_Location_Y/ 57.29577951)) + cos(${lng}/ 57.29577951) * cos(D.Dr_Location_Y/ 57.29577951) * cos((D.Dr_Location_X/ 57.29577951) - (${lat}/ 57.29577951))) <= 1`;
	//The above formula checks whether the geographical distance between user and location of any driver belongs to the range

	// console.log(query);

	try {
		connection = await oracledb.getConnection(dbconnection);

		result = await connection.execute(query);
	} catch (error) {
	} finally {
		if (connection) {
			await connection.close();
		}
		res.status(200).send(result);
	}
}
//
//
//
//
//
//--------- REQUESTS------------------

//POST request --> which means calls for inserting into database
//The parameters req and res means request and respose.
//Request means the data we get from the browser. req.body will store any data we send from the frontend for inserting into database.
//Response will store the data we get from the database and send it back to the browser. In this case, the data we insert will be sent back.
app.post('/userr', (req, res) => {
	data = req.body;

	//Format the obtained data into separate values and form an array with it
	const uid = data.u_id;
	const adminid = data.admin_id;
	const fname = data.Name_Fname;
	const lname = data.Name_Lname;
	const dob = data.dob;
	const phn = data.Phone_No;
	const uname = data.user_name;
	const pass = data.password;

	const senddata = [uid, adminid, fname, lname, dob, phn, uname, pass];

	sendUserData(req, res, senddata);
});

//POST request for updating user's current location
app.post('/updateuserlocation', (req, res) => {
	const data = req.body;

	const uid = data.u_id;
	const usertype = data.user_typ;
	var lat = 0;
	var lng = 0;

	if (usertype === 'C') {
		lat = data.C_Location_X;
		lng = data.C_Location_Y;
	} else if (usertype === 'D') {
		lat = data.DR_Location_X;
		lng = data.DR_Location_Y;
	}

	const senddata = [uid, usertype, lat, lng];
	// console.log('Post req got from user..', senddata);

	updateUserLocation(req, res, senddata);
});
//
//
//
//
//GET request for getting list of drivers arouund a certain range from the user
//Here ':' colon sign beside the word means it's a variable
//So any data in this field will be stored in lat variable
//Example in ---------> /getdriverlocation/23/90   ......... 23 will be stored in lat and 90 will be stored in lng
//The variables can be accessed using the req.params.<the variable name> command.
app.get('/getdriverlocation/:lat/:lng', (req, res) => {
	const lattitude = req.params.lat;
	const longitude = req.params.lng;

	getDriversWithinRange(req, res, lattitude, longitude);
});

//GET request for getting driver data

//GET request --> which means calls for getting data from the database
//Fetching user data where user id is given
app.get('/getuserdata/:id', (request, response) => {
	const usid = request.params.id; //ID is the user id using which we'll search the database

	getUserData(request, response, usid);
});

//GET request for getting user id from a username
app.get('/getuserid/:name', (request, response) => {
	const usname = request.params.name;
	console.log('Get request obtained', usname);

	getUserID(request, response, usname);
	//console.log('Data obtained from the user', response);
});

async function abcd(req, res) {
	const query = `select * from userr`;

	try {
		connection = await oracledb.getConnection(dbconnection);
		console.log('Connected');

		result = await connection.execute(query, {}, { autoCommit: true });
	} catch (error) {
	} finally {
		if (connection) {
			await connection.close();
			console.log('Connection ended');
		}
		res.status(200).send(result);
	}
}

app.get('/getu', (req, res) => {
	abcd(req, res);
});

//Listen to the specific port to connect to the server
//This is the main part of the backend server
//When we run the file using node <filename>	command, the file will listen for any type of requests
//through the mentioned port. In this case we declared port as port 5000. Any valid open ports can be used.
//When any requests are sent from the frontend to this port, the file will determine whether it's a
//GET request ---> Which means frontend is asking for data
//POST request ----> The frontend is sending data or storage
//The perform the required tasks based on the url and functions called from them
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
