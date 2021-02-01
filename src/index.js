//EXPRESS
const express = require('express');
const app = express();
const session = require('express-session');
//CONFIGURACIONES
const morgan = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./config/database');

//STEAM
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const cookieParser = require('cookie-parser');
var SteamCommunity = require('steamcommunity');

//SERVIDOR Y SOCKETS
var server = require('http').Server(app);
require('./config/socket').connection(server);
const {getSocket}= require('./config/socket')

var SteamCommunity = require('steamcommunity');
var SteamTotp = require("steam-totp");
var steam = new SteamCommunity();
var TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config/config.js');
var manager = new TradeOfferManager({
    "domain": "https://serversteam.vercel.app/", //your domain API KEY
    "language": "en",
    "pollInterval": 30000,
    "cancelTime" : 600000,
    "pendingCancelTime" : 600000
  
  });

var logOnOptions = {
	'accountName': config.accountName, //your username
	'password': config.password, //your pass
	'twoFactorCode': SteamTotp.generateAuthCode(config.sharedSecret) 
};
var identitySecret = config.identitySecret;








//usuario




//passport

passport.serializeUser(async(user, done) => {
	// console.log(user._json);
	
	done(null, user._json);
	// console.log(user._json)
	// done(null, user._json);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use(new SteamStrategy({
	returnURL: 'http://localhost:3000/auth/steam/return'
	, realm: 'http://localhost:3000/'
	, apiKey: config.apiKey
}, (identifier, profile, done) => {
	return done(null, profile);
}));


app.use(cookieParser());
var sesion =session({
	key: 'session_id'
	, secret: 'almatrass'
	, resave: true
	, saveUninitialized: true
	, cookie: {
		maxAge: 259200000
	}
})
app.use(sesion);

app.use(passport.initialize());
app.use(passport.session());

app.get(/^\/auth\/steam(\/return)?$/, passport.authenticate('steam', {
	failureRedirect: '/'
}), (req, res) => {
	res.redirect('/');

});

app.get('/logout', (req, res) => {
	req.logout();

	res.redirect('/');
});

//CONFIGURACIONES EXPRESS 
// settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// static files
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// middlewares
app.use(morgan('dev'));
//Rutas con Steam


steam.login(logOnOptions, function(err, sessionID, cookies, steamguard) {
	if (err) {
		console.log("There was an error logging in! Error details: " + err.message);
		process.exit(1); //terminates program
	} else {
		console.log("Successfully logged in as " + logOnOptions.accountName);
		steam.chatLogon();
		manager.setCookies(cookies, function(err) {
			if (err) {
				console.log(err);
				process.exit(1);
			}
		});
	}
	steam.startConfirmationChecker(10000, identitySecret); //Auto-confirmation enabled!
	
});


	
//
app.post('/items', async (req, res) => {


	if (req.user) {
		var data = req.body;
		var cont = 0;
		var total = 0;
		var steamid = req.user.steamid;
		var prom = req.user.personaname.indexOf("ABETSKIN.COM") > -1
		var porc;
		try {
			var result = await pool.query("SELECT * FROM usuario WHERE userId ='" + steamid + "'");
			var its = await pool.query("SELECT item,deposito FROM lista");
			if (result == 0) {
				res.json({ estado: "no se encontro registro ", succes: "error" })
			} else {
				if (result[0].oferta==="on") {
					res.json({ estado: "tienes una oferta pendiente", succes: "error" })				
					} else {
						if (result[0].url == "") {
							res.json({ estado: "Ingresa URL de intercambio", succes: "error" })
						} else {
							manager.loadUserInventory(steamid, 570, 2, true, (err, inventory) => {
								if (err) {
									res.json({ estado: "Al cargar inventario ", succes: "error" })
								} else {
									const offer = manager.createOffer(result[0].url);
									inventory.forEach(function (item) {
										for (var i = 0; i < data.length; i++) {
											if (item.assetid === data[i].assetid) {
												for (let a = 0; a < its.length; a++) {
													if (data[i].name == its[a].item) {
														if (prom == true) {
															porc = its[a].deposito *0.02 + its[a].deposito;
															total = total + porc 
														} else {
															total = total + its[a].deposito
														   
														}
														cont = cont + 1;
														offer.addTheirItem(item);
													}
												}
											}
										}
									})
									if (cont == data.length) {
										offer.getUserDetails((err, me, them) => {
											if (err) {
												res.json({ estado: "cant trade!", succes: "error" })
											} else {
												if (them.escrowDays === 0) {
													offer.send(async (err, status) => {
														if (err) {
															res.json({ estado: "Problema con el servidor de steam", succes: "error" })
														} else {
															if (status == 'pending') {
																steam.acceptConfirmationForObject(identitySecret, offer.id, function (err) {
																	if (err) {
																		console.log(err);
																	} else {
																		console.log("Offer confirmed");
																	}
																});
															} 
															total = total.toFixed(2)
															 pool.query("INSERT INTO depostio (steamid,dTime,estado,precio,offertId) VALUES('" + steamid + "',now(),'depositado'," + total + ",'" + offer.id + "')", (err, result) => {
																if (err) {
																	res.json({ estado: "no se pudo agregar offerta", succes: "error" });
																} else {
																	res.json({ estado: "Oferta enviada correctamente", succes: "success", offer: offer.id });
																}
															})

															 pool.query("UPDATE usuario Set oferta='on' WHERE userId=?",[steamid], (err, result) => { 
																if(err){
																	console.log("error actualizar");
																}else{
																	console.log("actualizado correctamente ofert");
																}
															  })		
														}
													})		
												} else {
													res.json({ estado: "tienes retención de  trade!", succes: "error" })
											 }
											}
										})
									} else {
										res.json({ estado: "Algun articulo ya no esta disponible", succes: "error" })
									}
								}
							})
						}
					}
			}
		} catch (error) {
			res.json({ estado: "erro de conexion ", succes: "error" })
		}
	}else {
		res.json({ estado: "Inicia Sesión", succes: "info" })
	 }
});



app.post('/windraw', async (req, res) => {
	
	if (req.user) {
		var cont = 0;
		var total = 0;
		let data = req.body;
		var steamid = req.user.steamid;
		try {
			var result = await pool.query("SELECT * FROM usuario WHERE userId ='" + steamid + "'");
			var its = await pool.query("SELECT item,retiro FROM lista");
			let {saldo , depositado,apostado}  = result[0];
			depositado = depositado/2;	
			if (depositado>apostado) {
				depositado = depositado-apostado;
				depositado = depositado.toFixed(2)
				res.json({ estado: `Debes aposta la mitad  de lo depositado - Falta por apostar:${depositado}`, succes: "error" })
			} else {	
				if (result === 0) {
					res.json({ estado: "no se encontro registro ", succes: "error" })
				} else {
					if (result[0].oferta==="on") {
					res.json({ estado: "tienes una oferta pendiente", succes: "error" })
						
					} else {
						if (result[0].url == "") {
							res.json({ estado: "Ingresa URL de intercambio", succes: "error" })
						} else {
							manager.getInventoryContents(570, 2, true, (err, inventory) => {
								if (err) {
									res.json({ estado: "Erro al cargar inventario ", succes: "error" })
								} else {
									const offer = manager.createOffer(result[0].url);
									inventory.forEach(function (item) {
										for (var i = 0; i < data.length; i++) {
											if (item.assetid === data[i].assetid) {
												for (let a = 0; a < its.length; a++) {
													if (data[i].name == its[a].item) {
														total = total + its[a].retiro
														cont = cont + 1;
														offer.addMyItem(item);
													}
												}
											}
										}
									})
									if (cont == data.length) {
										if (saldo>=total) {
											offer.getUserDetails((err, me, them) => {
												if (err) {
													res.json({ estado: "cant trade!", succes: "error" })
												} else {
													if (them.escrowDays === 0) {												
														let newSaldo = saldo - total;
														newSaldo = newSaldo.toFixed(2);
														pool.query("UPDATE usuario Set oferta='on' , saldo=? WHERE userId=?", [newSaldo,steamid], (err, result) => {
															if (err) {
																res.json({ estado: "Erro de conexión intentalo mas tarde", succes: "error" })

															} else {
																offer.send((err, status) => {
																	if (err) {
																		pool.query("UPDATE usuario Set saldo=?,oferta='off' WHERE userId=?", [saldo, steamid], (err, result) => {
																			if (err) {
																				res.json({ estado: "Erro de conexión intentalo mas tarde", succes: "error" })
																			} else {
																				res.json({ estado: "Erro con el servidor de Steam", succes: "error" });
																			}
																		});
																	} else {
																		if (status == 'pending') {
																			// We need to confirm it
																			steam.acceptConfirmationForObject(identitySecret, offer.id, async function (err) {
																					total = total.toFixed(2)
																					await pool.query("INSERT INTO depostio (steamid,dTime,estado,precio,offertId) VALUES('" + steamid + "',now(),'retiro'," + total + ",'" + offer.id + "')", (err, result) => {
																						if (err) {	
																							console.log(err)																		
																						} else {	
																							res.json({ estado: "Oferta enviada correctamente", succes: "success", offer: offer.id });

																					}
																					})

																				
																			});
																		}

																	}
					
																})
															}
														})												
													} else {
														res.json({ estado: "tienes retención de  trade!", succes: "error" })
													}
												}
											})
										} else {
											res.json({ estado: "Saldo Insuficiente", succes: "error" })	
										}
									} else {
										res.json({ estado: "Algun articulo ya no esta disponible", succes: "error" })
								}
								}
							})
						}
						
					}
					
				}
			}
			
		} catch (error) {
			console.log(error)
			res.json({ estado: "erro de conexion ", succes: "error" })
		}
	} else {
		res.json({ estado: "Inicia Sesión", succes: "info" })
	}
});

// routes
app.use(require('./routes'));
app.use(require('./routes/peticiones'));

manager.on("sentOfferChanged", async (offer, oldState) => { 
    try {

        let offertId = offer.id;
        if (offer.state === 2) {
            console.log("oferta enviada")
        } else {
            var resultados = await pool.query("SELECT * FROM depostio WHERE offertId ='" + offertId + "'");
            if (resultados[0].estado === "depositado") {
                console.log(` depositado`);
                if (offer.state === 3) {
                    var { steamid } = resultados[0]
                    var UserResult = await pool.query("SELECT saldo,depositado FROM usuario WHERE userId='" + steamid + "'");
                    var newSaldo = UserResult[0].saldo + resultados[0].precio;
                    var newDeposito = UserResult[0].depositado + resultados[0].precio;
                    newSaldo = newSaldo.toFixed(2);
                    newDeposito = newDeposito.toFixed(2);
                    await pool.query("UPDATE usuario Set saldo=?,depositado=?,oferta='off' WHERE userId=?", [newSaldo, newDeposito, steamid], (err, result) => {
                        if (err) {
                            console.log("error actualizar");
                        } else {
                            console.log("actualizado correctamente");
                        }
                    })
                } else {
                    var id = offer.id;
                    var { steamid } = resultados[0]
                    pool.query("DELETE FROM depostio WHERE offertId=?", [id], (err, result) => {
                        if (err) {
                            console.log("error al eliminar");
                        } else {
                            console.log("elminado correctamente");
                        }
                    })
                    pool.query("UPDATE usuario Set oferta='off' WHERE userId=?", [steamid], (err, result) => {
                        if (err) {
                            console.log("error actualizar ");
                        } else {
                            console.log("actualizado correctamente ");
                        }
                    })
                }
            } else {
                console.log(` oferta retiro`);
                if (offer.state === 3) {
                    var { steamid } = resultados[0]
                    pool.query("UPDATE usuario Set oferta='off' WHERE userId=?", [steamid], (err, result) => {
                        if (err) {
                            console.log("error actualizar");
                        } else {
                            console.log("actualizado correctamente 1");
                        }
                    })
                    console.log(` oferta aceptada 1`);
                } else {

                    var id = offer.id;
                    var { steamid } = resultados[0]
                    var UserResult = await pool.query("SELECT saldo FROM usuario WHERE userId='" + steamid + "'");
                    var newSaldo = UserResult[0].saldo + resultados[0].precio;
                    newSaldo = newSaldo.toFixed(2);
                    pool.query("UPDATE usuario Set saldo=?,oferta='off' WHERE userId=?", [newSaldo, steamid], (err, result) => {
                        if (err) {
                            console.log("error actualizar");
                        } else {
                            console.log("actualizado correctamente");
                        }
                    })
                    pool.query("DELETE FROM depostio WHERE offertId=?", [id], (err, result) => {
                        if (err) {
                            console.log("error al eliminar");
                        } else {
                            console.log("elminado correctamente");
                        }
                    })
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
     });

server.listen(app.get('port'), function() {
    console.log('Server on port', app.get('port'));
  });