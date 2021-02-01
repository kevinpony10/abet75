const express = require('express');
const router = express.Router();
const pool = require('../config/database');
var timeAgo = require('node-time-ago');
const config = require('../config/config.js');
var SteamCommunity = require('steamcommunity');

var consulta;

const {getSocket}= require('../config/socket')

function bose  (bo,id){
	
switch  (bo) {
		case  "BO-1":
		    pool.query('INSERT INTO tipo (bets_id,total1,total2,total,tipo,gameWin,estado) VALUES ("'+id+'",'+0.01+','+0.01+','+0.02+',"Global","team","Auto")', (err, result) => {
				if(err){
				  console.log(err);
				}
			  })
		  break;
		case "BO-2":
			pool.query('INSERT INTO tipo (bets_id,total1,total2,total,tipo,gameWin,estado) VALUES ("'+id+'",'+0.01+','+0.01+','+0.02+',"Global","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-1","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-2","team","Activo")', (err, result) => {
				if(err){
				  console.log(err);
				}
			  })
		  break;
		case "BO-3":
			pool.query('INSERT INTO tipo (bets_id,total1,total2,total,tipo,gameWin,estado) VALUES ("'+id+'",'+0.01+','+0.01+','+0.02+',"Global","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-1","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-2","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-3","team","Auto")', (err, result) => {
				if(err){
				  console.log(err);
				}
			  })
		  break;
		case "BO-5":
			pool.query('INSERT INTO tipo (bets_id,total1,total2,total,tipo,gameWin,estado) VALUES ("'+id+'",'+0.01+','+0.01+','+0.02+',"Global","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-1","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-2","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-3","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-4","team","Auto"),("'+id+'",'+0.01+','+0.01+','+0.02+',"Game-5","team","Auto")', (err, result) => {
				if(err){
				  console.log(err);
				}
			  })
		  break;
		  case  "JACK":

		
			  pool.query('INSERT INTO tipo (bets_id,total1,total2,total,tipo,gameWin,estado) VALUES ("'+id+'",'+0.01+','+0.01+','+0.02+',"Global","team","Auto")', (err, result) => {
				if(err){
					console.log(err);
				}
			  })

		    
		  break;
	
	  }

}

function apuesta (team){
 
	pool.query('INSERT INTO apuestas (id_steam,id_bet,apuesta,equipo,time) VALUES ("'+userId+'",'+bets+','+valor+',"'+team+'",now())', (err, result) => {
		if(err){
		  return 0 ;
		}else{
		  return 1 ;
		}
	  }) 

}




router.post('/agregar', async(req, res) => {
	if (req.user.steamid===config.id) {
	const {team1,team2,img1,img2,bo,win,game ,time,torneo,img3}= req.body;

	
	await pool.query('INSERT INTO bets (team1,team2,img1,img2,game,time,torneo, bo,win,imgTor) VALUES ("'+team1+'","'+team2+'","'+img1+'","'+img2+'","'+game+'","'+time+'","'+torneo+'","'+bo+'","'+win+'","'+img3+'")', (err, result) => {
	  if(err){
		res.json({estado:"no se pudo agregar",succes:"error"});
	  }else{
		res.json({estado:"Agregado correctamente",succes:"success"});
		var id = result.insertId;
        bose(bo,id);
	  }



	}) 
} 
  });


  router.post('/eliminar', async  (req, res) => {
	if (req.user.steamid===config.id) {
	const {id}= req.body;
	pool.query("DELETE FROM apuestas WHERE be=?",[id], (err, result) => { 
		if(err){
			console.log("no se eliminado correctamente 1")
		}else{
		  console.log("eliminado correctamente 1")
		}
	   
	  })

	   pool.query("DELETE FROM tipo WHERE bets_id=?",[id], (err, result) => { 
		if(err){
			console.log("no se eliminado correctamente 2")
		}else{
		  console.log("eliminado correctamente 2")
		}
	   
	  })
	
	 pool.query("DELETE FROM bets WHERE bets=?",[id], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo Eliminar",succes:"error"});
	  }else{
		res.json({estado:"Eliminado correctamente",succes:"success"});
	  }
	 
	})
}
  });

  
  router.post('/actualizar', async (req, res) => {
	if (req.user.steamid===config.id) {
	const {team1,team2,img1,img2,bo,win,id,time,game,torneo,img3}= req.body;
	await pool.query("UPDATE bets Set team1=?,team2=?,img1=?,img2=?,bo=?,win=?,game=?,time=?,torneo=?,imgTor=? WHERE bets=?",[team1,team2,img1,img2,bo,win,game,time,torneo,img3,id], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo actualizarr",succes:"error"});
	  }else{
		res.json({estado:"Actualizado correctamente",succes:"success"});
	  }
	}) 
}
  });

  //
  router.get('/tipo/:id',async  (req, res) => {
	
	if (req.user) {
		if (req.user.steamid===config.id) {
			let id = req.params.id;
			await pool.query('SELECT *   FROM tipo WHERE bets_id='+id, (err, result) => {
			 
			  res.json(result);
			})
		  
		}else{
			res.render('deposit.ejs', {
				user: ""
			})
		}
	}else{
		res.render('deposit.ejs', {
			user: ""
		})
	}


  });


  router.post('/insertar', async(req, res) => {
	if (req.user.steamid===config.id) {
    const {bet,tipo,estado}= req.body;
    await pool.query('INSERT INTO tipo (bets_id,total1,total2,total,tipo,gameWin,estado) VALUES ("'+bet+'",'+0.01+','+0.01+','+0.02+',"'+tipo+'","team","'+estado+'")', (err, result) => {
        if(err){
          res.json({estado:"no se pudo agregar",succes:"error"});
        }else{
          res.json({estado:"Agregado correctamente",succes:"success"});
        }
	  })  
	}
  });


  router.post('/update', async (req, res) => {
	if (req.user.steamid===config.id) {
	const {id,estado,tipo}= req.body;
	await pool.query("UPDATE tipo Set tipo=?,estado=? WHERE id=?",[tipo,estado,id], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo actualizarr",succes:"error"});
	  }else{
		res.json({estado:"Actualizado correctamente",succes:"success"});
	  }
	}) 
}
  });

  

  router.post('/delete', async  (req, res) => {
	if (req.user.steamid===config.id) {
	const {id}= req.body;
	
	await pool.query("DELETE FROM tipo WHERE id=?",[id], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo Eliminar",succes:"error"});
	  }else{
		res.json({estado:"Eliminado correctamente",succes:"success"});
	  }
	 
	})
}
  });



  router.post('/terminar', async (req, res) => {
	if (req.user.steamid===config.id) {
	const {id,game}= req.body;
	var estado ="Finalizado";
	var consulta = await pool.query("SELECT total1,total2,total FROM tipo   WHERE id ="+id+"")
	var {total1,total2,total}= consulta[0] ;
	 
	if (game == "Team-1") {
	var users = await pool.query("SELECT id_steam , apuesta, equipo ,saldo FROM apuestas INNER JOIN usuario ON apuestas.id_steam= usuario.userId    WHERE id_bet ="+id+" AND equipo='t'")    
      for (let i = 0; i < users.length; i++) {
		  var porc1 = 100* parseFloat(users[i].apuesta);
		  var p1 = parseFloat(porc1)/parseFloat(total1);
		  var mul1 = p1/100;
		  var saldo = mul1*total;
		  var newSaldo =parseFloat( users[i].saldo)+saldo;
		  newSaldo = newSaldo.toFixed(2);
		  var update = pool.query("UPDATE usuario Set saldo="+newSaldo+" WHERE userId="+users[i].id_steam+"")
	  }
	} else if (game == "Team-2"){
		var users = await  pool.query("SELECT id_steam , apuesta, equipo ,saldo  FROM apuestas INNER JOIN usuario ON apuestas.id_steam= usuario.userId    WHERE id_bet ="+id+" AND equipo='e'")    	  
		for (let i = 0; i < users.length; i++) {
			var porc1 = 100 * parseFloat(users[i].apuesta);
			var p1 = parseFloat(porc1) / parseFloat(total2);
			var mul1 = p1 / 100;
			var saldo = mul1 * total;
			var newSaldo = parseFloat(users[i].saldo) + saldo;
			newSaldo = newSaldo.toFixed(2);
			var update = pool.query("UPDATE usuario Set saldo="+newSaldo+" WHERE userId="+users[i].id_steam+"")
			
		}
	} else {
		var users = await pool.query("SELECT id_steam , apuesta, equipo ,saldo  FROM apuestas INNER JOIN usuario ON apuestas.id_steam= usuario.userId    WHERE id_bet ="+id+" ")    
		for (let i = 0; i < users.length; i++) {
			var newSaldo = parseFloat(users[i].saldo) + parseFloat(users[i].apuesta) 
			newSaldo = newSaldo.toFixed(2);
			var update = pool.query("UPDATE usuario Set saldo="+newSaldo+" WHERE userId="+users[i].id_steam+"")
			
		}
	}

	await	pool.query("UPDATE tipo Set estado=? , gameWin=? WHERE id=?",[estado,game,id], (err, result) => { 
		if(err){
		  res.json({estado:"no se pudo actualizarr",succes:"error"});
		}else{
		  res.json({estado:"Actualizado correctamente",succes:"success"});
		}
	  }) 

      
}
  });

  router.post('/agregar-item', async(req, res) => {
	if (req.user.steamid===config.id) {
	const {item,estado,deposito,porcentaje,game}= req.body;
	var suma = parseFloat(deposito);
	var retiro ;
	var total;
	var totalretiro;
	if (porcentaje=="10%") {
		total =suma*0.10 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}else if(porcentaje=="7%"){
		total =suma*0.07 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}else if(porcentaje=="15%"){
		total =suma*0.15 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}
	else{
		total =suma*0.05 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}
    
	await pool.query('INSERT INTO lista (item,deposito,porcentaje,retiro,estado,juego) VALUES ("'+item+'",'+suma+',"'+porcentaje+'",'+totalretiro+',"'+estado+'","'+game+'")', (err, result) => {
	  if(err){
		res.json({estado:"no se pudo agregar",succes:"error"});
	  }else{
		res.json({estado:"Agregado correctamente",succes:"success"});
	  }
	}) 
} 
  });

  router.post('/eliminar-item', async  (req, res) => {
	if (req.user.steamid===config.id) {
	const {id}= req.body;
	
	await pool.query("DELETE FROM lista WHERE id=?",[id], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo Eliminar",succes:"error"});
	  }else{
		res.json({estado:"Eliminado correctamente",succes:"success"});
	  }
	 
	})
}
  });

  router.post('/update-item', async (req, res) => {
	if (req.user.steamid===config.id) {
	const {id,estado,game,deposito,porcentaje}= req.body;
	var suma = parseFloat(deposito);
	var retiro ;
	var total;
	var totalretiro;
	if (porcentaje=="10%") {
		total =suma*0.10 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}else if(porcentaje=="7%"){
		total =suma*0.07 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}else if(porcentaje=="15%"){
		total =suma*0.15 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}
	else{
		total =suma*0.05 ;
		retiro=suma+total;
		totalretiro =retiro.toFixed(2);
	}

	await pool.query("UPDATE lista Set deposito=?,porcentaje=?,retiro=?,estado=?,juego=? WHERE id=?",[deposito,porcentaje,totalretiro,estado,game,id], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo actualizarr",succes:"error"});
	  }else{
		res.json({estado:"Actualizado correctamente",succes:"success"});
	  }
	}) 
}
  });

  router.post('/update-jack', async (req, res) => {
	if (req.user.steamid===config.id) {
	const {total,idjack,imgurl,personaname}= req.body;
	var newTotal = parseFloat(total);


	await pool.query("UPDATE apuestas Set id_steam=? , apuesta=? , idimg=? , personaname=? WHERE equipo=?",[idjack,newTotal,imgurl,personaname,"p"], (err, result) => { 
	  if(err){
		res.json({estado:"no se pudo actualizarr",succes:"error"});
	  }else{
		res.json({estado:"Actualizado correctamente",succes:"success"});
	  }
	}) 
}
  });


router.post('/itemsBusqueda', async (req, res) => {
	if (req.user.steamid===config.id) {
	var busqueda = req.body.buscar;
	await pool.query('SELECT * FROM lista WHERE item="'+busqueda+'"', (err, result) => {
		res.json(result);
	  })
	
	}
});




router.post('/apuesta', async (req, res) => {
	const { id, team, bets } = req.body;
	var dataT = new Date();
	var tiempoA = (new Date("2021-01-29T15:00:00.000")-dataT+1000)/1000;
     console.log(dataT+"-"+tiempoA)
	
	var valor = req.body.valor;
	if (req.user) {
		const userId = req.user.steamid;
		const name = req.user.personaname;
		const img = req.user.avatar;
		if (valor <= 0) {
			valor = valor * -1;
		}

		pool.query('SELECT id_steam FROM apuestas WHERE id_bet=' + id + ' AND id_steam=' + userId, (err, result) => {
			if (err) {

				res.json({ estado: "no se pudo realizar", succes: "error" });
			} else {
				if (result.length >= 1) {
					res.json({ estado: "ya tienes apuesta realizadas", succes: "error" });
				} else {

					pool.query('SELECT saldo,apostado FROM usuario WHERE userId=' + userId, (err, result) => {
						if (err) {

							res.json({ estado: "no se pudo realizar", succes: "error" });
						} else {

							var saldo = result[0].saldo;
							var apostado = result[0].apostado;
							if (saldo >= valor) {
								if (valor <= 0.05) {
									res.json({ estado: "apuesta mayor a 0.05", succes: "error" })
								} else {


									if (team == "t") {
										var newSaldo = saldo - valor;
										var newApostado = apostado + valor; 
										//posible error

										pool.query('SELECT total1,total,time,estado FROM tipo INNER JOIN bets ON bets.bets=tipo.bets_id WHERE id=' + id, (err, result) => {

											if (err) {

												res.json({ estado: "no se pudo realizar", succes: "error" });
											} else {
												var estado = result[0].estado;
												if (estado == "Auto") {
													var dataT2 = new Date(result[0].time);
													var total1 = Number(result[0].total1) + Number(valor);
													var total = Number(result[0].total) + Number(valor);
													var newtotal1 = total1.toFixed(2);
													var newtotal = total.toFixed(2);

													if (dataT2 > dataT) {
														pool.query("UPDATE usuario Set saldo=? , apostado=? WHERE userId=?", [newSaldo,newApostado, userId], (err, result) => {
															if (err) {

																res.json({ estado: "no se pudo realizar", succes: "error" });
															} else {



																pool.query("UPDATE tipo Set total1=?,total=? WHERE id=?", [newtotal1, newtotal, id], (err, result) => {
																	if (err) {
																		res.json({ estado: "no se pudo realizar", succes: "error" });
																	} else {
																		

																		pool.query('INSERT INTO apuestas (id_steam,personaname,id_bet,apuesta,equipo,timeBet,be,idimg) VALUES ("' + userId + '","' + name + '",' + id + ',' + valor + ',"t",now()-INTERVAL 5 HOUR,' + bets + ',"' + img + '")', (err, result) => {
																			if (err) {
																				res.json({ estado: "no se pudo realizar", succes: "error" });
																			} else {
																				res.json({ estado: "Apuesta realizada", succes: "success" });
																				var id_bet = result.insertId

																				pool.query('SELECT personaname,apuesta,tipo,timeBet,team1,img1,idimg FROM apuestas INNER JOIN usuario ON apuestas.id_steam = usuario.userId INNER JOIN tipo ON apuestas.id_bet= tipo.id INNER JOIN bets ON tipo.bets_id = bets.bets   WHERE id_apuesta=' + id_bet, (err, result) => {
																					if (err) {
																						console.log(error)
																					} else {
																						var { personaname, apuesta, tipo, timeBet, team1, img1, idimg } = result[0]
																						var time = timeAgo(timeBet);
																						var sal = apuesta.toFixed(2);
																					
																						var mensaje = [{ name: personaname, sal, tipo, time, team: team1, img: img1, idimg }]
																						getSocket().in(bets).emit('new', mensaje);
																					}
																				})



																			}
																		})


																	}
																})

															}
														})

													} else {
														res.json({ estado: "bet Inactiva", succes: "error" });
													}


												} else if (estado == "Activo") {

													var total1 = Number(result[0].total1) + Number(valor);
													var total = Number(result[0].total) + Number(valor);
													var newtotal1 = total1.toFixed(2);
													var newtotal = total.toFixed(2);


													pool.query("UPDATE usuario Set saldo=? , apostado=? WHERE userId=?", [newSaldo,newApostado, userId], (err, result) => {
														if (err) {

															res.json({ estado: "no se pudo realizar", succes: "error" });
														} else {


															pool.query("UPDATE tipo Set total1=?,total=? WHERE id=?", [newtotal1, newtotal, id], (err, result) => {
																if (err) {
																	res.json({ estado: "no se pudo realizar", succes: "error" });
																} else {


																	pool.query('INSERT INTO apuestas (id_steam,personaname,id_bet,apuesta,equipo,timeBet,be,idimg) VALUES ("' + userId + '","' + name + '",' + id + ',' + valor + ',"t",now()-INTERVAL 5 HOUR,' + bets + ',"' + img + '")', (err, result) => {
																		if (err) {
																			res.json({ estado: "no se pudo realizar", succes: "error" });
																		} else {
																			res.json({ estado: "Apuesta realizada", succes: "success" });
																			var id_bet = result.insertId

																			pool.query('SELECT personaname,apuesta,tipo,timeBet,team1,img1,idimg FROM apuestas INNER JOIN usuario ON apuestas.id_steam = usuario.userId INNER JOIN tipo ON apuestas.id_bet= tipo.id INNER JOIN bets ON tipo.bets_id = bets.bets   WHERE id_apuesta=' + id_bet, (err, result) => {
																				if (err) {
																					console.log(error)
																				} else {
																					var { personaname, apuesta, tipo, timeBet, team1, img1, idimg } = result[0]
																					var time = timeAgo(timeBet);
																					var sal = apuesta.toFixed(2);

																					var mensaje = [{ name: personaname, sal, tipo, time, team: team1, img: img1, idimg }]
																					getSocket().in(bets).emit('new', mensaje);
																				}
																			})



																		}
																	})


																}
															})
														}
													})

												} else {

													res.json({ estado: "bet Inactiva", succes: "error" });

												}


											}
										})




										// var time = timeAgo(new Date().toISOString());
										// console.log(time);

									} else {

										var newSaldo = saldo - valor;
										var newApostado = apostado + valor; 
										//posible error

										pool.query('SELECT total2,total,time,estado FROM tipo INNER JOIN bets ON bets.bets=tipo.bets_id  WHERE id=' + id, (err, result) => {
											if (err) {
												res.json({ estado: "no se pudo realizar", succes: "error" });
											} else {
												var dataT2 = new Date(result[0].time);
												var estado = result[0].estado;
												if (estado == "Auto") {
													if (dataT2 > dataT) {

														var total2 = Number(result[0].total2) + Number(valor);
														var total = Number(result[0].total) + Number(valor);
														var newtotal2 = total2.toFixed(2);
														var newtotal = total.toFixed(2);

														pool.query("UPDATE usuario Set saldo=? , apostado=? WHERE userId=?", [newSaldo,newApostado, userId], (err, result) => {
															if (err) {
																res.json({ estado: "no se pudo realizar", succes: "error" });
															} else {

																pool.query("UPDATE tipo Set total2=?,total=? WHERE id=?", [newtotal2, newtotal, id], (err, result) => {
																	if (err) {
																		res.json({ estado: "no se pudo realizar", succes: "error" });
																	} else {

																		pool.query('INSERT INTO apuestas (id_steam,personaname,id_bet,apuesta,equipo,timeBet,be,idimg) VALUES ("' + userId + '","' + name + '",' + id + ',' + valor + ',"e",now()-INTERVAL 5 HOUR,' + bets + ',"' + img + '")', (err, result) => {
																			if (err) {
																				res.json({ estado: "no se pudo realizar", succes: "error" });
																			} else {

																				res.json({ estado: "Apuesta realizada", succes: "success" });
																				var id_bet = result.insertId
																				pool.query('SELECT personaname,apuesta,tipo,timeBet,team2,img2,idimg FROM apuestas INNER JOIN usuario ON apuestas.id_steam = usuario.userId INNER JOIN tipo ON apuestas.id_bet= tipo.id INNER JOIN bets ON tipo.bets_id = bets.bets   WHERE id_apuesta=' + id_bet, (err, result) => {
																					if (err) {
																						console.log(error)
																					} else {
																						var { personaname, apuesta, tipo, timeBet, team2, img2, idimg } = result[0]
																						var time = timeAgo(timeBet);
																						var sal = apuesta.toFixed(2);

																						var mensaje = [{ name: personaname, sal, tipo, time, team: team2, img: img2, idimg }]
																						getSocket().in(bets).emit('new', mensaje);
																					}
																				})



																			}
																		})

																	}
																})

															}
														})

													} else {
														res.json({ estado: "bet Inactiva", succes: "error" });

													}


												} else if (estado == "Activo") {



													var total2 = Number(result[0].total2) + Number(valor);
													var total = Number(result[0].total) + Number(valor);
													var newtotal2 = total2.toFixed(2);
													var newtotal = total.toFixed(2);

													pool.query("UPDATE usuario Set saldo=? , apostado=? WHERE userId=?", [newSaldo,newApostado, userId], (err, result) => {
														if (err) {
															res.json({ estado: "no se pudo realizar", succes: "error" });
														} else {

															pool.query("UPDATE tipo Set total2=?,total=? WHERE id=?", [newtotal2, newtotal, id], (err, result) => {
																if (err) {
																	res.json({ estado: "no se pudo realizar", succes: "error" });
																} else {

																	pool.query('INSERT INTO apuestas (id_steam,personaname,id_bet,apuesta,equipo,timeBet,be,idimg) VALUES ("' + userId + '","' + name + '",' + id + ',' + valor + ',"e",now()-INTERVAL 5 HOUR,' + bets + ',"' + img + '")', (err, result) => {
																		if (err) {
																			res.json({ estado: "no se pudo realizar", succes: "error" });
																		} else {

																			res.json({ estado: "Apuesta realizada", succes: "success" });
																			var id_bet = result.insertId
																			pool.query('SELECT personaname,apuesta,tipo,timeBet,team2,img2,idimg FROM apuestas INNER JOIN usuario ON apuestas.id_steam = usuario.userId INNER JOIN tipo ON apuestas.id_bet= tipo.id INNER JOIN bets ON tipo.bets_id = bets.bets   WHERE id_apuesta=' + id_bet, (err, result) => {
																				if (err) {
																					console.log(error)
																				} else {
																					var { personaname, apuesta, tipo, timeBet, team2, img2, idimg } = result[0]
																					var time = timeAgo(timeBet);
																					var sal = apuesta.toFixed(2);

																					var mensaje = [{ name: personaname, sal, tipo, time, team: team2, img: img2, idimg }]
																					getSocket().in(bets).emit('new', mensaje);
																				}
																			})



																		}
																	})

																}
															})

														}
													})




												} else {
													res.json({ estado: "bet Inactiva", succes: "error" });

												}




											}
										})




									}
								}

							} else {
								res.json({ estado: "Saldo Insuficiente", succes: "error" })
							}
						}
					})

				}
			}
		})
	} else {
		res.json({ estado: "Inicia Sesión", succes: "info" })
	}
});



router.get('/valores/:id',async  (req, res) => {
	
	let id = req.params.id;
	var porc=[];
	var consulta=await pool.query('SELECT total1,total2,total FROM tipo WHERE id='+id )
				
		consulta.forEach((consult,i)=>{
			var {total1,total2,total}=consult;	
	
			var p1 = total1 * 100;
			var porc1 = p1/total;
		
			
		
		   
			var p2 = total2/total;
			var porc2 = 100 * p2;

		
	
			porc1=porc1.toFixed(0);
			porc2=porc2.toFixed(0);
	
			porc[i]={
				porc1:porc1,
				porc2:porc2,
				total1:total1,
				total2:total2,
				total:total
				}
			 
		})
			  res.json(porc);	

  });


  router.get('/last/:id',async  (req, res) => {
	
	let id = req.params.id;
	var resul =[];
	var ganador1;
	var ganador2;
	var text1;
	var text2;
	var consulta=await pool.query('SELECT tipo,gameWin FROM tipo WHERE bets_id='+id )
				
		consulta.forEach((consult,i)=>{
			

			if (consult.gameWin=="Team-1") {
				ganador1 = "WIN"
				ganador2 = "LOSS"
				text1 = "text-success"
				text2 = "text-danger"
				
			}else if(consult.gameWin=="Cancelado"){
				ganador1 = "Cancel"
				ganador2 = "Canel"
				text1 = "text-danger"
				text2 = "text-danger"
			}else if(consult.gameWin=="Empate"){
				ganador1 = "Draw"
				ganador2 = "DraW"
				text1 = "text-warning"
				text2 = "text-warning"

			}
			else{
				ganador1 ="LOSS" 
				ganador2 = "WIN"
				text1 = "text-danger" 
				text2 ="text-success"
				

			}
		
			resul[i]={
				ganador1,ganador2,text1,text2,tipo:consult.tipo

			}
		
	      
			
		
		})
		
			  res.json(resul);	

  });

  router.post('/url', async  (req, res) => {
	const {url}= req.body;
	var user = req.user.steamid;
	await pool.query("UPDATE usuario Set url=? WHERE userId=?",[url,user], (err, result) => { 
		if(err){
		  res.json({estado:"no se pudo actualizarr",succes:"error"});
		}else{
		  res.json({estado:"URL INGRESADO",succes:"success"});
		}
	  })
  });
 
  module.exports = router;