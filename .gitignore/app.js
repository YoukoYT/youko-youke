const { Client, Util, RichEmbed } = require('discord.js');
const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const fs = require('fs');


const client = new Client({ disableEveryone: true });

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

let xp = require("./xp.json");

var version = 1.0;
var version1 = 0.4;

client.on('warn', console.warn);

client.on('error', console.error);

client.on("ready", () => {
	console.log(`Je suis prêt en version: v${version}.${version1} !`); 
	//type: PLAYING, STREAMING, LISTENING, WATCHING;
	client.user.setActivity(PREFIX +`help | v${version}.${version1} | MàJ Join/Quit message !`, { type: 'LISTENING' });
	//setStatus: Online, idle, invisible, dnd
	client.user.setStatus('Online')
  });

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log(`I am reconnecting now!`));

client.on("guildMemberAdd", member => {
	let role = member.guild.roles.find("name", "👀 Viewer")
	member.addRole(role)
	member.createDM().then(channel => {
			return channel.send(`**Bienvenue sur notre serveur Discord Youko & Youke ${member} Je te souaite de passé un bon séjour !** \nSi tu as besoin de moi fait dans un salon textuel sur le serveur **` +PREFIX+`help**\nNotre chaîne YouTube: https://www.youtube.com/channel/UC_13NdvFBLpb5Cd0IFs9g5w et pour finir n'hésite pas a faire de la pub a notre discord: https://discord.gg/9AnFXus`) & client.channels.find("name", "bienvenue").send({embed: {
				color: 16769343,
				title: "Bienvenue !",
				description: `Je te souaite de passer un bon séjour ${member} sur le serveur discord !`,
			},
		})
	}).catch(console.error)
});
client.on("guildMemberRemove", member => {
	client.channels.find("name", "bienvenue").send({embed: {
				color: 16769343,
				title: "Aurevoir",
				description: `${member} vient de quitter !`,
			},
		})
});

client.on('message', async msg => {

	if (msg.author.bot) 
		return undefined;
	if (!msg.content.startsWith(PREFIX)) 
		return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(PREFIX.length)


if(command === "version") {
	msg.channel.send({embed: {
		color: 15158332,
		title: "Version:",
		description: `🤖 Ma version est: __**v${version}.${version1}**__ !`,
	},
	});

}else if(command === "kick") {
	if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
		return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");

	let reason = args.slice(1).join(' ');
	let user = msg.mentions.users.first();
	let modlog = client.channels.find('name', 'mod-log');

		if (!modlog) 
			return msg.reply('Je ne peux pas trouver un canal de mod-log');
		if (reason.length < 1) 
			return msg.reply('Vous devez fournir une raison pour le kick');
		if (msg.mentions.users.size < 1) 
			return msg.reply('Vous devez mentionner quelqu\'un pour le **kick**').catch(console.error);
		if (!msg.guild.member(user).kickable) 
		  	return msg.reply(':warning: **Je ne peux pas kick ce membre**');
		msg.guild.member(user).kick();
			const embed = new RichEmbed()
		 	.setColor(0x00ff04)
		 	.setTitle(`Modération`)
			.addField('Action: Kick','______')
			.addField('Membre: '+`${user.username}#${user.discriminator}  (${user.id})`,'______')
			.addField('Raison: '+reason,'______')
			.addField('Par: '+`${msg.author.username}#${msg.author.discriminator}`,'______')
			.setTimestamp()
			return client.channels.get(modlog.id).sendEmbed(embed);

}else if(command === "ban") {
	if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
		return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");

	  let reason = args.slice(1).join(' ');
	  let user = msg.mentions.users.first();
	  let modlog = client.channels.find('name', 'mod-log');

		if (!modlog) 
		  	return msg.reply('Je ne peux pas trouver un canal de mod-log');
		if (reason.length < 1) 
			return msg.reply('Vous devez fournir une raison pour le **ban**');
		if (msg.mentions.users.size < 1) 
		  	return msg.reply('Vous devez mentionner quelqu\'un pour le ban').catch(console.error);
		if (!msg.guild.member(user).bannable) 
		 	return msg.reply(':warning: **Je ne peux pas kick ce membre**');
	msg.guild.ban(user, 2);
	 	 const embed = new RichEmbed()
	 	.setColor(0x00ff04)
		.setTitle(`Modération`)
		.addField('Action: Ban','______')
		.addField('Membre: '+`${user.username}#${user.discriminator} / (${user.id})`,'______')
		.addField('Raison: '+reason,'______')
		.addField('Par: '+`${msg.author.username}#${msg.author.discriminator}`,'______')
		.setTimestamp()
	return client.channels.get(modlog.id).sendEmbed(embed);

}else if(command === "unban") {
	  if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
		  return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");
	  let reason = args.slice(1).join(' ');
	  client.unbanReason = reason;
	  client.unbanAuth = msg.author;
	  let user = args[0];
	  let modlog = client.channels.find('name', 'mod-log');
		if (!modlog) 
			return msg.reply('Je ne peux pas trouver un canal de mod-log');
		if (reason.length < 1) 
			return msg.reply('Vous devez fournir une raison pour le **unban**');
		if (!user) 
		  	return msg.reply('Vous devez fournir un utilisateur résolu, tel qu\'un ID utilisateur.').catch(console.error);
	  msg.guild.unban(user);
	  	const embed = new RichEmbed()
		.setColor(0x00ff04)
		.setTitle(`Modération`)
		.addField('Action: Unban','______')
		.addField('Membre: '+user,'______')
		.addField('Raison: '+reason,'______')
		.addField('Par: '+`${msg.author.username}#${msg.author.discriminator} / (${user.id})`,'______')
		.setTimestamp()
	return client.channels.get(modlog.id).sendEmbed(embed);
		

}/**else if(command === "del"){}

}**/else if(command === "help") {
	const help_embed = new RichEmbed()
		.setTitle("Voici mes Commandes !\n\n\n___")
		.setColor('0xF0FFF0')
		.setTitle(`Help`)
		.addField("Général", "\n\n\n- **&help**: Sert a afficher la liste des commandes.\n\n- **&version**:  Sert a connaître la version du bot.\n\n- **&level**:  Sert a connaître son niveau sur le serveur.\n\n\n___")
		.addField("Modération", '- **&del**: Sert a supprimer entre 2 à 100 messages. (En Dev)\n\n- **&kick**: Sert a kick un membre.\n\n- **&ban**: Sert a ban un membre.\n\n- **&mute**: Sert a mute/unmute un membre.\n\n- **&warn**: Sert a warn un membre.\n\n- **&sondage**: Sert a créer des sondage.\n\n- **&muterole**: Sert a créer le role mute.\n\n- **&sondagerole**: Sert a créer le role sondage.\n\n\n___')
		.addField("Musique","- **&play**: Sert a démarrer/ajouter une musique a la liste d'attente.\n\n**- &join**: Sert a connecter le bot dans son salon vocal.\n\n- **&stop**: Sert a déconnecter le bot d'un salon vocal.\n\n- **&skip**: Sert a avancer d'une musique sur la liste d'attente.\n\n**- &volume**: Sert a augmenter/diminuer le volume.\n\n- **&pause**: Sert a mettre en pause la musique.\n\n- **&resume**: Sert a enlever la pause.\n\n- **&np**: Sert à connaître la musique en train de jouer.\n\n- **&queue**: Sert a connaître la liste de musique en attente.\n\n\n___")
		.setFooter("©Youko & Youke 2018\nTous droits réservés")
	msg.channel.sendEmbed(help_embed);

}else if(command === "warn"){
	if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
		return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");
	let reason = args.slice(1).join(' ');
	let user = msg.mentions.users.first();
	let modlog = client.channels.find('name', 'mod-log');
		if (!modlog) 
			return msg.reply('Je ne peux pas trouver un canal de mod-log');
		if (reason.length < 1) 
			return msg.reply('Vous devez fournir une raison pour l\'avertissement.');
		if (msg.mentions.users.size < 1) 
			return msg.reply('Vous devez mentionner quelqu\'un pour les avertir.').catch(console.error);
		  	const embed = new RichEmbed()
		  		.setColor(0x00ff04)
		 		.setTitle(`Modération`)
				.addField('Action: Warn ','______')
				.addField('Membre: '+`${user.username}#${user.discriminator} / (${user.id})`,'______')
				.addField('Raison: '+reason,'______')
				.addField('Par: '+`${msg.author.username}#${msg.author.discriminator}`,'______')
				.setTimestamp()
			return client.channels.get(modlog.id).sendEmbed(embed);

}else if(command === "mute"){
	if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
		return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");
	let reason = args.slice(1).join(' ');
	let user = msg.mentions.users.first();
	let modlog = client.channels.find('name', 'mod-log');
	let muteRole = client.guilds.get(msg.guild.id).roles.find('name', 'Mute');
		if (!modlog) 
			return msg.reply('I cannot find a mod-log channel').catch(console.error);
		if (!muteRole) 
			return msg.reply('Je ne peux pas trouver un rôle **mute** utilise +muterole').catch(console.error);
		if (reason.length < 1) 
			return msg.reply('Vous devez fournir une raison pour le **mute.**').catch(console.error);
		if (msg.mentions.users.size < 1) 
			return msg.reply('Vous devez mentionner quelqu\'un pour le **mute**').catch(console.error);
			const embed = new RichEmbed()
				.setColor(0x00ff04)
				.setTitle(`Modération`)
				.addField('Action: Mute/Unmute','______')
				.addField('Membre: '+`${user.username}#${user.discriminator} / (${user.id})`,'______')
				.addField('Raison: '+reason,'______')
				.addField('Par: '+`${msg.author.username}#${msg.author.discriminator}`,'______')
				.setTimestamp()
		if (!msg.guild.member(client.user).hasPermission('MANAGE_ROLES_OR_PERMISSIONS')) 
			return msg.reply('Je n\'ai pas les permissions correctes.').catch(console.error);
	
		if (msg.guild.member(user).roles.has(muteRole.id)) {
			msg.guild.member(user).removeRole(muteRole).then(() => {
		  	client.channels.get(modlog.id).sendEmbed(embed).catch(console.error);
		});
	  	}else{
			msg.guild.member(user).addRole(muteRole).then(() => {
			client.channels.get(modlog.id).sendEmbed(embed).catch(console.error);
		});
	  }
	
}else if(command === "muterole"){
	
		if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
		  return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");
		let role = msg.guild.roles.find(r => r.name === "Mute");
			if(!role){
		  		try {
					role = await msg.guild.createRole({
			  		name: "Mute",
			  		color:"#CC00FF",
			 		permissions:[]
			});
			msg.guild.channels.forEach(async (channel, id) => {
			  await channel.overwritePermissions(role, {
				SEND_MESSAGES: false,
				ADD_REACTIONS: false
			  });
			});return msg.channel.send('Role **mute** crée');
		  } catch (e) {
			console.log(e.stack)
		  }
		}
	
		if(toMute.roles.has(role.id)) return await(toMute.removeRole(role)) & msg.channel.send("Je l'ai unmuté !");
	
		await msg.channel.send("Cet utilisateur n'est pas mute");
	
		return;

}else if(command === "sondagerole"){
	
	if(!msg.member.roles.some(r=>["Administrateur", "Modérateur"].includes(r.name)) )
	  return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");
	let role = msg.guild.roles.find(r => r.name === "Sondage");
		if(!role){
			  try {
				role = await msg.guild.createRole({
				  name: "Sondage",
				  color:"#97f0e1",
				 permissions:[]
		});
		return msg.channel.send('Role **sondage** crée');
	  } catch (e) {
		console.log(e.stack)
	  }
	}
}else if (command === 'sondage') {
	if(!msg.member.roles.some(r=>["Sondage"].includes(r.name)) )
		return msg.reply("Désolé, vous n'avez pas les permissions pour l'utiliser !");
	let args = msg.content.split(' ').slice(1);
	let thingToEcho = args.join(' ')
	msg.reply(`Sondage **`+thingToEcho+`** a été crée avec succès !`)
	var embed = new RichEmbed()
		.setTitle("Sondage")
		.addField(thingToEcho+ " !", "Répondre avec ✅ ou ❎")
		.setColor("0x97f0e1")
		.setTimestamp()
		msg.guild.channels.find("name", "sondage").sendEmbed(embed)
		.then(function (msg) {//❌ ⭕️
			msg.react("✅") & msg.react("❎")
		}).catch(function() {
		});
}else if (command === 'youko') {
	msg.channel.send({embed: {
		color: 15158332,
		title: "Youko est la perfection incarnée. Il est extrêmement rare de voir un homme aussi parfait.",
	},
});
}else if (command === 'youke') {
	msg.channel.send({embed: {
		color: 15158332,
		title: "Youke es une très belle personne pleine de charisme. Il est très rare d'en trouver encore de nos jours.",
	},
});
}else if (command === 'play') {
	const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) 
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `Je suis désolé mais vous devez être dans un canal vocal pour jouer de la musique !`,
			},
		});
		
		//msg.channel.send('Je suis désolé mais vous devez être dans un canal vocal pour jouer de la musique!');
	const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `Je ne peux pas me connecter à votre canal vocal, assurez-vous d\'avoir les autorisations appropriées !`,
			},
		});
			
			//msg.channel.send(' Je ne peux pas me connecter à votre canal vocal, assurez-vous d\'avoir les autorisations appropriées!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `Je ne peux pas parler dans ce canal de voix, assurez-vous que j\'ai les permissions appropriées !`,
			},
		});
			
			//msg.channel.send(' Je ne peux pas parler dans ce canal de voix, assurez-vous que j\'ai les permissions appropriées!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id);
				await handleVideo(video2, msg, voiceChannel, true);
			}
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `✅ Playlist: **${playlist.title}** a été ajouté à la file d\'attente!`,
			},
		});
			
			//msg.channel.send(`✅ Playlist: **${playlist.title}** a été ajouté à la file d\'attente!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send({embed: {
						color: 15158332,
						title: "Musique",
						description: `__**Song selection:**__\n\n\n${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}\n\n\nVeuillez indiquer une valeur pour sélectionner l'un des résultats de recherche compris entre 1 et 10.`,
					},
				});
					/*msg.channel.send(`
__**Song selection:**__

${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}

Veuillez indiquer une valeur pour sélectionner l'un des résultats de recherche compris entre 1 et 10.
					`);*/
				try {
					var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
						maxMatches: 1,
						time: 10000,
						errors: ['time'],
					});
				} catch (err) {
					console.error(err);
					return msg.channel.send({embed: {
						color: 15158332,
						title: "Musique",
						description: `Valeur non valide ou non validé, annulation de la sélection de la vidéo`,
					},
				});
						
						//msg.channel.send('Valeur non valide ou non valide, annulation de la sélection de la vidéo');
			}
				const videoIndex = parseInt(response.first().content);
				var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
			} catch (err) {
				console.error(err);
				return msg.channel.send({embed: {
					color: 15158332,
					title: "Musique",
					description: `🆘 Je n\'ai pas pu obtenir de résultats de recherche.`,
				},
		});		
		}
	}
		return handleVideo(video, msg, voiceChannel);
}
}else if (command === 'join') {
	if (!msg.member.voiceChannel) 
		return msg.channel.send('Vous n\'êtes pas dans un canal vocal!');
        	msg.member.voiceChannel.join();
        	msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `Je rejoint ton salon`,
			},
		});
    	return;
}else if (command === 'skip') {
	if (!msg.member.voiceChannel) 
		return msg.channel.send(' Vous n\'êtes pas dans un channel vocal!');
	if (!serverQueue) 
		return msg.channel.send({embed: {
		color: 15158332,
		title: "Musique",
		description: `❌Erreur: Il n\'y a rien à jouer !`,
	},
});
		
		//msg.channel.send('Il n\'y a rien que je puisse faire pour vous.');
	serverQueue.dispatcher.end('La commande de skip a été utilisée!');
	return undefined;
}else if (command === 'stop') {
	if (!msg.member.voiceChannel) 
		return msg.channel.send(' Vous n\'êtes pas dans un channel vocal!');
	if (serverQueue) 
		return queue.delete(), serverQueue.dispatcher.leave, msg.member.voiceChannel.leave();
	if (!serverQueue) 
		return queue.delete(),serverQueue.dispatcher.leave;
			return undefined;
}else if(command === 'volume'){
	(args[0] >= 100)
	serverQueue.dispatcher.setVolume(1.0);
	console.log(serverQueue.volume + " 2");
	serverQueue.volume = 1.0;
	console.log(serverQueue.volume + " 3");
	msg.channel.send(`[100%] 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷`, { code: "less" });
}else if (command === 'info') {
		info = new RichEmbed()
			.setTitle(`Information sur le serveur Discord`)
			.addField(`Nom du Discord: `, msg.guild.name)
			.addField(`Crée le: `, msg.guild.createdAt)
			.addField('Tu as rejoint le:', msg.guild.joinedAt)
			.addField('Total des membre: ', 'Nous sommes: '+ msg.guild.memberCount)
			.setFooter(`© Copyright 2018, Youko & Youke`)
			.setColor(0x1E90FF);
			msg.channel.sendEmbed(info);
}else if (args[0] >= 0 && args[0] < 100) {
	serverQueue.dispatcher.setVolume(parseInt(args[0]) / 100);
	console.log(serverQueue.volume + "4");
	serverQueue.volume = parseInt(args[0]) / 100;
	console.log(serverQueue.volume + " 5");
	args[0] < 100 && args[0] > 90 ?
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷`, { code: "less" }) : args[0] <= 90 && args[0] > 80 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔶`, { code: "less" }) : args[0] <= 80 && args[0] > 70 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔷🔷🔷🔷🔶🔶`, { code: "less" }) : args[0] <= 70 && args[0] > 60 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔷🔷🔷🔶🔶🔶`, { code: "less" }) : args[0] <= 60 && args[0] > 50 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔷🔷🔶🔶🔶🔶`, { code: "less" }) : args[0] <= 50 && args[0] > 40 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔷🔶🔶🔶🔶🔶`, { code: "less" }) : args[0] <= 40 && args[0] > 30 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔷🔶🔶🔶🔶🔶🔶`, { code: "less" }) : args[0] <= 30 && args[0] > 20 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔷🔶🔶🔶🔶🔶🔶🔶`, { code: "less" }) : args[0] <= 20 && args[0] > 10 ? 
	msg.channel.send(`[${args[0]}%] 🔷🔷🔶🔶🔶🔶🔶🔶🔶🔶`, { code: "less" }) :
	msg.channel.send(`[${args[0]}%] 🔷🔶🔶🔶🔶🔶🔶🔶🔶🔶`, { code: "less" });
}else if (command === 'np') {
	if (!serverQueue) 
		return msg.channel.send('Il n`\'y a rien à jouer.');
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `🎶 Lecture en cours: **${serverQueue.songs[0].title}**`,
				},
			});
		//msg.channel.send(`🎶 Lecture en cours: **${serverQueue.songs[0].title}**`);
}else if (command === 'queue') {
	let index = "", titles = "", big_q = "";
    let server = serverQueue;
	let limit = 10;
	let numberOfSongs = !server.songs ? 0 : server.songs.length;
    let numberOfPages = Math.ceil(numberOfSongs/limit);
    let i = 0;
    	if (!serverQueue.songs) {
        	index += `#\n`; titles += `Rien.\n`; big_q = "_ _\n";
        } else {
            let long_queue = server.songs.length > limit;
        	for (i = 0; i < (long_queue ? limit : server.songs.length); i++) {
            	if (i == 0) {
                    index += `#\n`;
                    titles += server.songs[i].title > 22 ? `\`${server.songs[i].title.substr(0, 22)}...\`\n` : `\`${server.songs[i].title}\`\n`;
                } else if (i > 0) {
                    index += `${i}\n`
                    titles += server.songs[i].title > 22 ? `\`${server.songs[i].title.substr(0, 22)}...\`\n` : `\`${server.songs[i].title}\`\n`;
                }
            }
            if (long_queue) big_q += `et ${serverQueue.songs.length - limit} chansons de plus ...\n`;
            else big_q = "_ _\n";
				}

	queue_embed = new RichEmbed()
				.setTitle(`Musique`)
			 // .addField(`Indexes`, index, false)
				.setDescription(`La liste de(s) musique(s) à jouer !`)
        .addField(`Titles`, titles, true)
        .addField(`${big_q}`, `_ _`, false)
        .setFooter(numberOfPages === 1 ? `Page [${Math.floor(i/numberOfSongs*numberOfPages)}/${numberOfPages}]` : numberOfPages === 0 ? `Page [0/0]` : `Pages [${Math.floor(i/numberOfSongs*numberOfPages)}/${numberOfPages}]`)
        .setColor(0xe74c3c);

        msg.channel.send("", { embed: queue_embed });

}else if (command === 'pause') {
	if (serverQueue && serverQueue.playing) {
		serverQueue.playing = false;
		serverQueue.connection.dispatcher.pause();
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: "⏸ Suspension la musique !",
			},
		});
			
			//msg.channel.send('⏸ Suspension la musique pour vous!');
		}
		return msg.channel.send('Il n\'y a rien à jouer.');

}else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.dispatcher.resume();
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: "▶ Reprise de la musique !",
			},
		});
			
			//msg.channel.send('▶ Reprise la musique pour toi!');
		}
		return msg.channel.send({embed: {
			color: 15158332,
			title: "Musique",
			description: "❌Erreur: Il n\'y a rien à jouer !",
		},
	});
		
		//msg.channel.send('Il n\'y a rien à jouer.');

}else if (command === 'level') {
	if(!xp[msg.author.id]){
		xp[msg.author.id] = {
		  xp: 0,
		  level: 1
	   };
	 }
	   let curxp = xp[msg.author.id].xp;
	   let curlvl = xp[msg.author.id].level;
	   let nxtLvlXp = curlvl * 300;
	   let difference = nxtLvlXp - curxp;
	 
	   let lvlEmbed = new RichEmbed()
	   .setAuthor(msg.author.username)
	   .setColor(0x585858)
	   .addField("Level", curlvl, true)
	   .addField("XP", curxp, true)
	   .setFooter(`${difference} XP pour level up !`, msg.author.displayAvatarURL);
	 
	   msg.channel.send(lvlEmbed);	 
}
	return undefined;
});
//XP
client.on("message", async msg => {
	let xpAdd = Math.floor(Math.random() * 7) + 8;
	
	if(!xp[msg.author.id]){
	  xp[msg.author.id] = {
		xp: 0,
		level: 1
	  };
	}
	
	
	let curxp = xp[msg.author.id].xp;
	let curlvl = xp[msg.author.id].level;
	let nxtLvl = xp[msg.author.id].level * 300;
	xp[msg.author.id].xp =  curxp + xpAdd;
	if(nxtLvl <= xp[msg.author.id].xp){
	  xp[msg.author.id].level = curlvl + 1;
	  let lvlup = new RichEmbed()
	  .setTitle("Level Up !")
	  .setColor(0x585858)
	  //.setDescription("Level: "+curlvl + 1);
	  .addField("Level: ", curlvl + 1)
	  .setFooter(`${msg.author.username}#${msg.author.discriminator}`, msg.author.displayAvatarURL);
	
	  msg.channel.send(lvlup);
	}
	fs.writeFile("./xp.json", JSON.stringify(xp), (err) => {
	  if(err) console.log(err)
		});
	});
//Musique
async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
		
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			dispatcher: null,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
            await voiceChannel.join().then(connection => {
                queueConstruct.connection = connection;
                play(msg.guild, connection);
            })
        }catch (error) {
			console.error(`Je n'ai pas pu rejoindre le canal vocal: ${error}`);
			queue.delete(guild.id);
			return msg.channel.send({embed: {
				color: 15158332,
				title: "Musique",
				description: `Je ne pouvais pas rejoindre le channel vocal: ${error}`,
			},
		});
			
			//msg.channel.send(`Je ne pouvais pas rejoindre le channel vocal: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send({embed: {
			color: 15158332,
			title: "Musique",
			description: `✅ **${song.title}** a été ajouté à la file d'attente !`,
		},
	});
		
		
		//msg.channel.send(`✅ **${song.title}** a été ajouté à la file d'attente!`);
	}
	return undefined;
}

function play(guild, connection) {
    var serverQueue = queue.get(guild.id);

    //if (!serverQueue.songs[0] || guild.voiceConnection) {
    //    serverQueue.voiceChannel.leave();
    //    queue.delete(guild.id);
    //    return;
    //}

	var stream = ytdl(serverQueue.songs[0] ? serverQueue.songs[0].url : "https://www.youtube.com/watch?v=IN4F0TkPSiM", { filter: 'audioonly' });
    serverQueue.dispatcher = connection.playStream(stream, {volume: 0.5});
		serverQueue.textChannel.send({embed: {
			color: 15158332,
			title: "Musique",
			description: `🎶 Commence à jouer: **${serverQueue.songs[0].title}**`,
		},
	});
		
		//.send(`🎶 Start playing: **${serverQueue.songs[0].title}**`);


    serverQueue.dispatcher.on('end', () => {
        serverQueue.songs.shift();
		if(serverQueue.songs[0]) play(guild, connection);
		else { serverQueue.textChannel.send({embed: {
			color: 15158332,
			title: "Musique",
			description: `Il n\'y à plus aucun son à joué ! Je quitte le salon !`,
		},
	});
			
			//send("Il n\'y à plus aucun son à joué. Je quitte le salon.");
						connection.disconnect();
						queue.delete(guild.id);
            return;
		
		} });

    serverQueue.dispatcher.setVolume(serverQueue.volume / 100);

}

client.login(TOKEN);
