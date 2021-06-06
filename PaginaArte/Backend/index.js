const express    = require("express"); // Gestión de las peticiones HTTP
const mysql      = require('mysql');
const util = require('util'); // Gestión de la base de datos
const cors = require("cors")
const morgan = require('morgan');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

var app = express();

app.use(cors());
app.use(morgan('dev'));

app.use(fileUpload());

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({extended: false,limit: '60mb'}));

app.set('port', process.env.PORT || 3000);

app.get('/',(req, res) => {
    res.send('Mi primer server!');
})

app.listen(app.get('port'), () =>{
    console.log('server up en el puerto: '+ app.get('port'));
})

function crearConexion(){
    connection=  mysql.createConnection({
        host     : 'localhost',
        port     : '3306',
        user     : 'root',
        password : '',
        database : 'artDB'
	});
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

/* ------------------ End Points Usuario Espectador ---------------------*/

app.get("/getUsers", async function(req, res){
	const connectionDB = crearConexion();
	var mensaje = "OK";
	try{
		const users= await connectionDB.query('SELECT * FROM usuarios');
		console.log('the solution is: ', users);
		res.json(users);
	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
		res.send(mensaje);
	} finally {
		await connectionDB.close();
	}
});

app.get("/getUserImage/:idUser", async function(req, res){
	const connectionDB = crearConexion();
	var mensaje = "OK";
	try{
		const obras= await connectionDB.query('SELECT * FROM usuarios WHERE id = ?' , req.params.idUser );
		res.end(obras[0].imagen);
	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
		res.send(mensaje);
	} finally {
		//await connectionDB.close();
	}
});

app.post("/insertUser", async function(req,res){
	let mensaje="OK";
	const bodyInformation = req.body;
	const imagenData = req.files
	//console.log(imagenData.imagen);
	const connectionDB = crearConexion();
	
	try{
        const verify = await connectionDB.query("SELECT * FROM usuarios WHERE email = ?", req.body.email)
        if(verify.length > 0){
            mensaje = "correo ya registrado"
        }else{
            const results = await connectionDB.query("INSERT INTO usuarios SET nombre = ?, apellido = ? , edad = ? , email = ?, password = ? , rol = ?, descripcion = ? , imagen = ?", 
										[bodyInformation.nombre,bodyInformation.apellido, bodyInformation.edad, bodyInformation.email, bodyInformation.password, bodyInformation.rol, bodyInformation.descripcion,imagenData.imagen.data]);
            
			//console.log(results);
        }

	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
	} finally {
		await connectionDB.close();
		res.send(mensaje);
	}
});

app.post("/loginUser", async function(req,res){
	let mensaje="OK";
	const bodyInformation = req.body;
	console.log(bodyInformation);
	const connectionDB = crearConexion();
	
	try{
        const user = await connectionDB.query("SELECT * FROM usuarios WHERE email = ? AND password = ? ", [req.body.email, req.body.password])
        if(user.length > 0){
            mensaje = {auth: true, user:user}
            res.status(200);
        }else{
            mensaje = "Usuario o contraseña incorrecto"
            res.status(401);
        }

	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
	} finally {
		await connectionDB.close();
		res.send(mensaje);
	}
});



/* ------------------ End Points Obras ---------------------*/

app.get("/getObras", async function(req, res){
	const connectionDB = crearConexion();
	var mensaje = "OK";
	try{
		const obras= await connectionDB.query('SELECT id, nombre, nombreExplore, descripcion, categoria  FROM obra');
		//console.log('the solution is: ', obras);
		res.json(obras);
	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
		res.send(mensaje);
	} finally {
		await connectionDB.close();
	}
});


app.get("/getObraFoto/:idObra", async function(req, res){
	const connectionDB = crearConexion();
	var mensaje = "OK";
	try{
		const obras= await connectionDB.query('SELECT * FROM obra WHERE id = ?' , req.params.idObra );
		res.end(obras[0].imagen);
	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
		res.send(mensaje);
	} finally {
		//await connectionDB.close();
	}
});

app.get("/getObra/:idObra", async function(req, res){
	const connectionDB = crearConexion();
	var mensaje = "OK";
	try{
		const obra= await connectionDB.query('SELECT id, nombre, descripcion, precio, nombreExplore FROM obra WHERE id = ?' , req.params.idObra );
		const user = await connectionDB.query('SELECT usuarios.nombre, usuarios.apellido, userobra.fkUser, userobra.fkObra FROM usuarios INNER JOIN userobra ON usuarios.id = userobra.fkUser AND userobra.fkObra = ?', req.params.idObra)
		const response = obra[0]
		response.user = user[0]
		res.send(response);
	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
		res.send(mensaje);
	} finally {
		await connectionDB.close();
	}
});

app.get("/getUserObra/:idUser", async function(req, res){
	const connectionDB = crearConexion();
	var mensaje = "OK";
	try{
		const user= await connectionDB.query('SELECT id, nombre FROM usuarios WHERE id = ?' , req.params.idUser );
		const obras = await connectionDB.query('SELECT obra.id, obra.nombre, userobra.fkUser, userobra.fkObra FROM obra INNER JOIN userobra ON obra.id = userobra.fkObra AND userobra.fkUser = ?', req.params.idUser)
		const response = user[0]
		response.obras = obras
		res.send(response);
	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
		res.send(mensaje);
	} finally {
		//await connectionDB.close();
	}
});

app.post("/setObraUser", async function(req,res){
	let mensaje="OK";
	const bodyInformation = req.body;
	console.log(bodyInformation);
	const connectionDB = crearConexion();
	
	try{
        const verify = await connectionDB.query("SELECT * FROM userobra WHERE fkUser = ? AND fKObra = ?", [req.body.fkUser, req.body.fkObra])
        if(verify.length > 0){
            mensaje = "usted ya compro esta pieza de arte"
        }else{
            const results = await connectionDB.query("INSERT INTO userobra SET ?", bodyInformation);
            console.log("insertado");
        }

	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
	} finally {
		await connectionDB.close();
		res.send(mensaje);
	}
});


app.post("/insertPost", async function(req,res){
	let mensaje="OK";
	const bodyInformation = req.body;
	const imagenData = req.files
	//console.log(imagenData.imagen);
	const connectionDB = crearConexion();
	
	try{
        
		const results = await connectionDB.query("INSERT INTO obra SET nombre = ?, nombreExplore = ? , categoria = ? , precio = ?, descripcion = ? , imagen = ?", 
									[bodyInformation.nombre,bodyInformation.nombreExplore, bodyInformation.categoria, bodyInformation.precio, bodyInformation.descripcion,imagenData.imagen.data]);
		
		console.log(results)
		
		const results2 = await connectionDB.query("INSERT INTO userobra SET fkUser = ?, fkObra = ?", [bodyInformation.userId,results.insertId])
        

	} catch ( err ) {
		console.log('Error while performing Query');
		console.log(err);
		mensaje= "NO_OK";
	} finally {
		await connectionDB.close();
		res.send(mensaje);
	}
});



app.get('/finaly', async function(req, res){
	const connectionDB = crearConexion();
	res.send({message: "conección cerrada"})
	await connectionDB.close();
})