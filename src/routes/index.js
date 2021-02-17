const express = require('express');
const router = express.Router();
const pool = require('../config/database');
var timeAgo = require('node-time-ago');
const config = require('../config/config.js');
const TradeOfferManager = require('steam-tradeoffer-manager');

const manager = new TradeOfferManager({
    "domain": "https://serversteam.vercel.app/", //your domain API KEY
    "language": "en",
    "pollInterval": 30000,
    "cancelTime" : 600000,
    "pendingCancelTime" : 600000
  
  });



var consulta;

async function value(user){
	 var {steamid,personaname} =user;
	 var saldo = 0;
	 var array=[]

	var serult = await pool.query("SELECT * FROM usuario WHERE userId ='" + steamid + "'");
	if (serult == 0) {
		pool.query('INSERT INTO usuario (userId,saldo,name_id,url,code,estado,prom,apostado,depositado) VALUES ("' + steamid+ '",' + 0 + ',"' + personaname + '","","",0,"off",' + 0 + ',' + 0 + ' )', (err, result) => {
			if (err) {
				console.log("error");
			}
		});
		saldo= saldo.toFixed(2);
		array.saldo = saldo;
		array.depositado  = 0;
		array.apostado = 0
		array.estado= 0;
		array.url = "";
		array.code = "";
		array.prom = "off"

	} else {
		let prom = personaname.indexOf("ABETSKINS.COM") > -1
		var promo;
		if (prom===true) {
			 promo = "on";
			
		} else {
			 promo = "off";
		}
      
		saldo=serult[0].saldo;
		saldo= saldo.toFixed(2);
		array.saldo = saldo;
		array.depositado = serult[0].depositado;
		array.apostado= serult[0].apostado;
		array.estado= serult[0].estado;
		array.url = serult[0].url;
		array.code= serult[0].code;
		array.prom = promo;
	}
	return array
}

 async function crono(crono){
	var now = new Date();
	
	var time;
	var cronometro=[];
	for (let i = 0; i < crono.length; i++) {
		
		var tiempo = (new Date(crono[i].time)-now+1000)/1000;
	    var minutos =('0'+Math.floor(tiempo / 60 % 60 )).slice(-2);
		var horas = ('0'+Math.floor(tiempo / 3600 % 24 )).slice(-2);
		var dias = Math.floor(tiempo/(3600*24));
		if (dias>=1) {
			time =dias+"d:"+horas+"h"
			
		}else{
			if (now>crono[i].time) {
				time ="En Vivo"	
				
				
			}else{
				time =horas+"h:"+minutos+"m"
			}
			
		}

			var p1 = crono[i].total1* 100;
			var porc1 = p1/crono[i].total;
		
			
		
		   
			var p2 = crono[i].total2/crono[i].total;
			var porc2 = 100 * p2;

		
	
			porc1=porc1.toFixed(0);
			porc2=porc2.toFixed(0);



		
		cronometro[i]={
			id:crono[i].bets,
			team1:crono[i].team1,
			team2:crono[i].team2,
			img1:crono[i].img1,
			img2:crono[i].img2,
		    game:crono[i].game,
			bo:crono[i].bo,
			win:crono[i].win,
			time:time,
			torneo:crono[i].torneo,
			ico:crono[i].ico,
			porc1,
			porc2
		}
		
	}
	
	return cronometro
}

async function valores(items,nameS) {
	var newItems = [];
	consulta = await pool.query("SELECT * FROM lista");
	var prom = nameS.indexOf("ABETSKIN.COM") > -1
	var porc;

	for (let a = 0; a < items.length; a++) {

		for (let i = 0; i < consulta.length; i++) {
			if (consulta[i].item == items[a].name) {
				var retiro = consulta[i].deposito;
				if (prom==true) {
					porc = retiro *0.02 + retiro;
				}else{
					porc = retiro;
				}
				var ret = porc.toFixed(2);
				
				newItems[a] = {
					name: items[a].name,
					assetid: items[a].assetid,
					img: items[a].img,
					retiro: ret

				}

			}

		}
	}

	return newItems



}

async function retiro(items){
	var newItems=[];
	consulta = await pool.query("SELECT * FROM lista");

for (let a = 0; a < items.length; a++) {
	var ind = consulta.length;
	
	for (let i = 0; i < ind; i++) {

		if (consulta[i].item == items[a].name) {
			var retiro =consulta[i].retiro;
			var ret=retiro.toFixed(2);
			newItems[a]={
			   name: items[a].name,
			   assetid: items[a].assetid,
			   img: items[a].img,
			   retiro:ret

			}
			ind=-1;
		}
		 
	 }
}
	
return newItems
  

   
}

async function lastbets(resultados){
	var last = [];
	
	resultados.forEach((resul,i) => {
	    var {team1,team2,img1,img2,game,time,gameWin,bets}= resul;
		var f = new Date(time);
		var ganador ;
		var mes = 1+parseInt(f.getMonth()) 
		var newtime = f.getDate() + "/"+ mes+ "/" +f.getFullYear();
		

		if (gameWin=="Team-1") {
			ganador = 1
		} else if(gameWin=="Cancelado") {
			ganador = 3
		}else if(gameWin=="Empate") {
			ganador = 4
		}
		else{
			ganador = 2
		}
	     
		last[i]= {
			team1,team2,img1,img2,game,newtime,ganador,bets
		}
		
	});
	return last
		
}

async function betjac (bets){
	var jackpot = []
	var acumulado ;

	      var p1 = bets[0].total1* 100;
			var porc1 = p1/bets[0].total;
			
			var porc3 = bets[0].total*0.10;
			acumulado = 10 + porc3
			
		
		   
			var p2 = bets[0].total2/bets[0].total;
			var porc2 = 100 * p2;

		
	
			porc1=porc1.toFixed(0);
			porc2=porc2.toFixed(0);
			acumulado=acumulado.toFixed(2);

	jackpot[0]={

		id:bets[0].bets,
			team1:bets[0].team1,
			team2:bets[0].team2,
			img1:bets[0].img1,
			img2:bets[0].img2,
			porc1,
			porc2,
			acumulado
	}

	return jackpot
	
}

async function topUser(users){
	var top =[];
	 users.forEach((user,i)=> {
		 var apuesta=user.apuesta;
		 apuesta= apuesta.toFixed(2);
        top[i]={
			nameId:user.personaname,
			idimg:user.idimg,
			apuesta
		}
		 
	 });
	 return top ;

}

async function userjack(users){
	var top =[];
	 users.forEach((user,i)=> {
		 var apuesta=user.apuesta;
		 apuesta= apuesta.toFixed(2);
        top[i]={
			nameId:user.personaname,
			idimg:user.idimg,
			apuesta
		}
		 
	 });
	 return top ;

}

async function history(historias){
	var his = [];
	var team ;
	var img ;
	var t;
	historias.forEach((historia,i)=> {

	var {total1,total2,total,apuesta,timeBet,equipo,por}=historia;

	 var apu = historia.apuesta;
	  apu=apu.toFixed(2);
	  var f = new Date(timeBet);
	  var mes = 1+parseInt(f.getMonth()) 
	  var newtime = f.getDate() + "/"+ mes+ "/" +f.getFullYear();
	  var ptotal = por * apuesta;
	  ptotal= ptotal.toFixed(2);

		if (historia.equipo == "t") {
			var porc1 =100 * apuesta;
			var p1 = porc1/total1
			var mul1 = p1/100;
			 t = mul1*total

		

			team = historia.team1
			img= historia.img1;
			

		}else{
			var porc2 =100 * apuesta;
			var p2 = porc2/total2
			var mul2 = p2/100;
			 t = mul2*total

          
			
			team = historia.team2
			img= historia.img2;
		}

		t=t.toFixed(2);

          his[i]={
			  apuesta:apu,
			  team,
			  img,
			  t,
			  win:historia.gameWin,
			  newtime,
			  game:historia.game,
			  equipo,
			  ptotal,
			  por

		  }
		
	});
	his.reverse();
	return his ;
}



router.get('/', async (req, res) => {
	const consulta = await pool.query(`SELECT * FROM tipo INNER JOIN bets ON tipo.bets_id = bets.bets WHERE bets.win="Pendiente" AND tipo.tipo="Global" ORDER BY time ASC` );
	const consulta2 = await pool.query(`SELECT bets, team1, team2, img1, img2,game, time,gameWin FROM bets INNER JOIN tipo ON bets.bets=tipo.bets_id WHERE win="Finalizado"  AND tipo.tipo="Global"  ORDER BY time DESC LIMIT 14` );
    const  consulta3 = await pool.query(`SELECT * FROM bets INNER JOIN tipo ON bets.bets = tipo.bets_id  WHERE tipo.tipo="Global" AND  bo = "JACK" ORDER BY time ASC LIMIT 1`)
	const consulta4 = await pool.query(`SELECT personaname,idimg,apuesta FROM apuestas INNER JOIN usuario ON apuestas.id_steam=usuario.userId WHERE timeBet BETWEEN DATE_SUB(NOW(),INTERVAL 1 WEEK) AND NOW()  ORDER BY  apuesta DESC LIMIT 3`) 
	const consulta5 = await pool.query(`SELECT personaname, apuesta ,idimg FROM apuestas INNER JOIN usuario ON usuario.userId=apuestas.id_steam  WHERE equipo= "p" LIMIT 1`)
	var bets = await crono(consulta);
	var last = await lastbets(consulta2);
	var jack = await betjac(consulta3);
	var top = await topUser(consulta4);
	var us = await  userjack(consulta5)
	
	if (req.user) {
		
		var validar= req.user;
		var val = await value(validar) 
      
		res.render ('index'  ,  {
			user:  validar,
			saldo:val,
			bets:bets,
			last:last,
			jack:jack,
			top :top,
			us:us
			
		});
		
	
	
		
		
	
	} else {
		
	 res.render('index', {
			   user:"",
			   bets:bets,
			   last:last,
			   jack:jack,
			   top :top,
			   us:us
		})
	
	}		
});


router.get('/bets/:i',async (req, res) => {

	var id = req.params.i
	var porc=[];
	const consulta = await pool.query("SELECT * FROM bets ,tipo WHERE bets.bets='"+id+"' AND tipo.bets_id='"+id+"'");


	consulta.forEach((consult,i)=>{
		var {total1,total2,total}=consult;	
		var p1 = total1/total;
		var porc1 =100 * p1;
		var pc1=(total1/total)*100;
		

		var p2 = total2/total;
		var porc2 = 100 * p2;
		var pc2=(total2/total)*100;

		if (pc1 <= 30) {
			if (pc1 <= 24) {
				if (pc1 <= 14) {
					if (pc1 <= 7) {
						pc1 = pc1 + 4;
					
					} else {
						pc1 = pc1 + 3.5;
						
					}
				} else {
					pc1 = pc1 + 2.5;
				
				}
		
			} else {
				pc1 = pc1 + 1;
				
			}
		}
		if(pc1<95){
			pc1 = 5 + pc1;
			
		}
		var xpor1 = 100 / pc1;
		

		if (pc2 <= 30) {
			if (pc2 <= 24) {
				if (pc2 <= 14) {
					if (pc2 <= 7) {
						pc2 = pc2 + 4;
					
					} else {
						pc2 = pc2 + 3.5;
						
					}
				} else {
					pc2 = pc2 + 2.5;
					
				}
		
			} else {
				pc2 = pc2 + 1;
			
			}
		}

		if(pc2<95){
			pc2 = 5 + pc2;
			
		}
		var xpor2 = 100 / pc2;
		
		
		porc1=porc1.toFixed(0);
		xpor1 = xpor1.toFixed(2);
		porc2=porc2.toFixed(0);
		xpor2 = xpor2.toFixed(2);
       


		porc[i]={
			porc1:porc1,
			porc2:porc2,
			total1,
			total2,
			total,
			id:consult.id,
			xpor1,
			xpor2
		}
		 
	})

	var consu = await pool.query('SELECT name_id,apuesta,tipo,timeBet,team1,img1,equipo,team2,img2,idimg,personaname FROM apuestas INNER JOIN usuario ON apuestas.id_steam = usuario.userId INNER JOIN tipo ON apuestas.id_bet= tipo.id INNER JOIN bets ON tipo.bets_id = bets.bets   WHERE be='+id+' ORDER BY id_apuesta DESC LIMIT 6');
	var apuestas =[] ;
	
	consu.forEach((ele , i) => {
		var {name_id,apuesta,tipo,timeBet,team2,img2,team1,img1,equipo,idimg,personaname}= ele;

		var time = timeAgo(timeBet);
		var sal = apuesta.toFixed(2);
		
		if (equipo=="t") {
			apuestas[i]={name:personaname,sal,tipo,time,team:team1,img:img1,idimg}
		}else{
			 apuestas[i]={name:personaname,sal,tipo,time,team:team2,img:img2,idimg}
		}
		   
		
	});



	if (req.user) {
		var validar= req.user;
		var val = await value(validar) 
		
	
	
		res.render('bets.ejs', { user: validar,saldo:val ,consulta:consulta,porc:porc,apuestas:apuestas})
	} else {
		

		res.render('bets.ejs', {
			user: "" ,consulta:consulta,porc:porc,apuestas:apuestas
		})
	}
})


router.get('/profile',async(req,res)=>{
	if (req.user) {
		var validar= req.user;
		var val = await value(validar) 
		var consulta = await pool.query("SELECT apuesta,equipo,timeBet,total1,total2,total,team1,team2,img1,img2,gameWin,game,por FROM apuestas INNER JOIN tipo ON  apuestas.id_bet=tipo.id INNER JOIN bets ON apuestas.be=bets.bets  WHERE id_steam ='"+req.user.steamid+"'")
		var histo = await history(consulta); 
		res.render('profile.ejs',{user:validar,saldo:val,his:histo})
		} else {
			res.render('profile.ejs', {
		       user:""
			})
	}	
})

//
router.get('/deposit', async(req, res) => {
	if (req.user) {
		var validar= req.user;
		var val = await value(validar) 
		var usuario = req.user.steamid;
		let nameS= req.user.personaname;
		var items=[];
	
		manager.loadUserInventory  (usuario, 570, 2, true, async (err, inventory) => {
			if (err) {
				console.log(err);
			} else {
				inventory.forEach(function (item) {
					items.push({
						name: item.name,
						assetid: item.assetid,
						img: item.icon_url
					});
				})
				
				items.sort(function(a, b) {
  
					var nameA = a.name.toUpperCase();
					var nameB = b.name.toUpperCase();

					if (nameA < nameB) { return -1; } if (nameA > nameB) {
						return 1;
					}

					return 0;

				});
				 
				
				  var newitems = await valores(items,nameS);
				 
				   items = newitems.filter(function (el) {
					return el != null;
				  });

				  items.sort(function (a, b) {

					return b.retiro - a.retiro
				  
				  });
				
				res.render('deposit.ejs', { user: validar,saldo:val, items:items })
			
			}
		});
	} else {

		res.render('deposit.ejs', {
			user: ""
		})
	}
});


//
router.get('/withdraw', async (req, res) => {

	if  (req.user) {
		
		var validar = req.user;
		var val = await value(validar) 

		var usuario = config.id;
		var items = [];
		manager.loadUserInventory(usuario, 570, 2, true, async (err, inventory) => {
			if (err) {
				console.log(err);
			} else {
	
				inventory.forEach(function (item) {
	
					items.push({
						name: item.name,
						assetid: item.assetid,
						img: item.icon_url
					});
					
				})

				items.push({
					name: "Genuine Lava Baby Roshan",assetid: "172548657458",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXA7hlNJ48g5hlcTlXvVeu-34DRUl9tNwtEvrurFAJs1v7NfylD4I2JmIGZkPK6ZuLTkDhQ6ZJ13r2Rooj3iVDhqUpqamqhdYOVdgY4ZVqGrge3xu2-14j84sr7rf-Rlg/330x192"}
				   ,{name: "Pilgrimage of the Bladeform Aesthete", assetid: "1725496574523",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXP7g1bJ4Q1lgheXknVSffi1t3eXE9LIwtFia6tLjhm0uXHYzRW6eO6m4GPnvnzDKjShG5U5vp9i_vG8MLzjAzt-kJoZW7zJteTdwVrYFmE81O3wL3t08e96JmdwXBh6SN0sHuLgVXp1nMShjMQ/330x192"}
				   ,{name: "Golden Origins of Faith", assetid: "1725476545743",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcUzpw9UQU3XQqu53pjsUlNgLAlWsb-aIgpt3OHccDEN-NXhq4mGmvjmJ7rdqWpD5cpj29bN9J7yjRq180Y9MWClIIbDJlRoNFrTqVW9lLq8gsXqvM_MzCY26CQl5ynaykDhn1gSOezyJfwa/330x192"}
				   ,{name: "Mace of Aeons", assetid: "1725476541223",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU0qBhYQEnDVNu72MbXHFB1JgFoubyaKgJv3eCHfDxB6eO5kr-Kkvj6IITdl3lW7Ysg2ruQpdrx3Vfn-0VrMWqmdYSUcVI3YAnX8lTowbjq1MK_tJTByHU3pGB8sozGalTm/330x192"}

				   );
                  
               
				items.sort(function (a, b) {
	
					var nameA = a.name.toUpperCase();
					var nameB = b.name.toUpperCase();
	
					if (nameA < nameB) { return -1; } if (nameA > nameB) {
						return 1;
					}
	
					return 0;
	
				});

			
	
				var newitems = await retiro(items);
	
				items = newitems.filter(function (el) {
					return el != null;
				});
	
	
				items.sort(function (a, b) {
	
					return b.retiro - a.retiro
				  
				  });	
				  res.render('withdraw.ejs', { user: validar,saldo:val, items: items })
			}
		});
	
		
	} else {

		var usuario = config.id;
		var items = [];

		manager.loadUserInventory(usuario, 570, 2, true, async (err, inventory) => {
			if (err) {
				console.log(err);
			} else {
	
				inventory.forEach(function (item) {
	
					items.push({
						name: item.name,
						assetid: item.assetid,
						img: item.icon_url
					});
				})

				items.push({
					name: "Genuine Lava Baby Roshan",assetid: "172548657458",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXA7hlNJ48g5hlcTlXvVeu-34DRUl9tNwtEvrurFAJs1v7NfylD4I2JmIGZkPK6ZuLTkDhQ6ZJ13r2Rooj3iVDhqUpqamqhdYOVdgY4ZVqGrge3xu2-14j84sr7rf-Rlg/330x192"}
				   ,{name: "Pilgrimage of the Bladeform Aesthete", assetid: "1725496574523",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXP7g1bJ4Q1lgheXknVSffi1t3eXE9LIwtFia6tLjhm0uXHYzRW6eO6m4GPnvnzDKjShG5U5vp9i_vG8MLzjAzt-kJoZW7zJteTdwVrYFmE81O3wL3t08e96JmdwXBh6SN0sHuLgVXp1nMShjMQ/330x192"}
				   ,{name: "Golden Origins of Faith", assetid: "1725476545743",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcUzpw9UQU3XQqu53pjsUlNgLAlWsb-aIgpt3OHccDEN-NXhq4mGmvjmJ7rdqWpD5cpj29bN9J7yjRq180Y9MWClIIbDJlRoNFrTqVW9lLq8gsXqvM_MzCY26CQl5ynaykDhn1gSOezyJfwa/330x192"}
				   ,{name: "Mace of Aeons", assetid: "1725476541223",img: "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcU0qBhYQEnDVNu72MbXHFB1JgFoubyaKgJv3eCHfDxB6eO5kr-Kkvj6IITdl3lW7Ysg2ruQpdrx3Vfn-0VrMWqmdYSUcVI3YAnX8lTowbjq1MK_tJTByHU3pGB8sozGalTm/330x192"}

				   );

				items.sort(function (a, b) {
	
					var nameA = a.name.toUpperCase();
					var nameB = b.name.toUpperCase();
	
					if (nameA < nameB) { return -1; } if (nameA > nameB) {
						return 1;
					}
	
					return 0;
	
				});
	
				var newitems = await retiro(items);
	
				items = newitems.filter(function (el) {
					return el != null;
				});
	
	
				items.sort(function (a, b) {
	
					return b.retiro - a.retiro
				  
				  });	
		         res.render('withdraw.ejs', {user: "",items:items})
	
			}
		});
		
	}
})


router.get('/consola',async(req,res)=>{
	if (req.user) {
		if(req.user.steamid==="76561198982979277") {
			var validar= req.user;
			var val = await value(validar) 
		    res.render('consola.ejs',{user:validar,saldo:val})
		}else {
			res.render('deposit.ejs', {
				user: ""
			})
		}
        }else {
			res.render('deposit.ejs', {
				user: ""
			})
		}
	
})

router.get('/consola-bets',async (req,res)=>{
	if (req.user) {
	if (req.user.steamid==="76561198982979277") {
		var bets = await pool.query("SELECT * FROM bets ORDER By win DESC");
		res.json(bets);
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
})


router.get('/items',async(req,res)=>{
	if (req.user) {
		if(req.user.steamid==="76561198982979277") {
			var validar= req.user;
			var val = await value(validar) 
		    res.render('items.ejs',{user:validar,saldo:val})
		}else {
			res.render('deposit.ejs', {
				user: ""
			})
		}
        }else {
			res.render('deposit.ejs', {
				user: ""
			})
		}
	
})


router.get('/itemsList',async (req,res)=>{
	if (req.user) {
	if (req.user.steamid==="76561198982979277") {
		var bets = await pool.query("SELECT * FROM lista ORDER By item ASC");
		res.json(bets);
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
})


router.get('/itemsDeposit',async (req,res)=>{
	if (req.user) {
	if (req.user.steamid==="76561198982979277") {
		var bets = await pool.query("SELECT * FROM depostio  ORDER BY id DESC LIMIT 30");
	
		res.json(bets);
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
})


router.get('/referido', async (req, res) => {
	if (req.user) {
		
		var validar= req.user;
		var val = await value(validar) 
				res.render('code.ejs', { user: validar,saldo:val})

			}else {
		res.render('withdraw.ejs', {
			user: ""
		})
	}
})

router.get('/blog', async (req, res) => {
	if (req.user) {
		
		var validar= req.user;
		var val = await value(validar) 
				res.render('blog.ejs', { user: validar,saldo:val})

			}else {
		res.render('withdraw.ejs', {
			user: ""
		})
	}
})


router.get('/questions', async (req, res) => {
	if (req.user) {
		
		var validar= req.user;
		var val = await value(validar) 
				res.render('questions.ejs', { user: validar,saldo:val})

			}else {
		res.render('withdraw.ejs', {
			user: ""
		})
	}
})

router.get('/acerca', async (req, res) => {
	if (req.user) {
		
		var validar= req.user;
		var val = await value(validar) 
				res.render('acerca.ejs', { user: validar,saldo:val})

			}else {
		res.render('withdraw.ejs', {
			user: ""
		})
	}
})

module.exports = router;