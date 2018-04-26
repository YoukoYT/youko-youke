const { Client, Util, RichEmbed } = require('discord.js');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const client = new Client({ disableEveryone: true });

const youtube = new YouTube(process.env.GOOGLE_API_KEY);

const queue = new Map();

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('Je suis prêt !'));

client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => {

	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(process.env.PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(process.env.PREFIX.length)

	if (command === 'play') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('Je suis désolé mais vous devez être dans un canal vocal pour jouer de la musique!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send(' Je ne peux pas me connecter à votre canal vocal, assurez-vous d\'avoir les autorisations appropriées!');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send(' Je ne peux pas parler dans ce canal de voix, assurez-vous que j\'ai les permissions appropriées!');
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id);
				await handleVideo(video2, msg, voiceChannel, true);
			}
			return msg.channel.send(`✅ Playlist: **${playlist.title}** a été ajouté à la file d\'attente!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
					msg.channel.send(`
__**Song selection:**__

${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}

Veuillez indiquer une valeur pour sélectionner l'un des résultats de recherche compris entre 1 et 10.
					`);
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time'],
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('Valeur non valide ou non valide, annulation de la sélection de la vidéo');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send('🆘 Je n\'ai pas pu obtenir de résultats de recherche.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === 'join') {
		if (!msg.member.voiceChannel) return msg.channel.send('Vous n\'êtes pas dans un canal vocal!');
        msg.member.voiceChannel.join();
        msg.channel.send("Je rejoint le salon.");
        return;
	} else if (command === 'skip') {
		if (!msg.member.voiceChannel) return msg.channel.send(' Vous n\'êtes pas dans un channel vocal!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === 'leave') {
		if (!msg.member.voiceChannel) return msg.channel.send(' Vous n\'êtes pas dans un channel vocal!'), msg.member.voiceChannel.leave(), msg.channel.send("Je quitte le salon.");
        if (serverQueue) return queue.delete(msg.guild.id), msg.member.voiceChannel.leave(),msg.channel.send("Je quitte le salon.");
        msg.member.voiceChannel.leave();
        msg.channel.send("Je quitte le salon.");
        return;
	} else if (command === 'volume') {
		if (args[0] >= 100) {
			serverQueue.dispatcher.setVolume(1.0);
					console.log(server.volume + " 2");
					server.volume = 1.0;
					console.log(server.volume + " 3");
					msg.channel.send(`[100%] 🔷🔷🔷🔷🔷🔷🔷🔷🔷🔷`, { code: "less" });
		} else if (args[0] >= 0 && args[0] < 100) {
			serverQueue.dispatcher.setVolume(parseInt(args[0]) / 100);
				console.log(server.volume + " 4");
				serverQueue = parseInt(args[0]) / 100;
				console.log(server.volume + " 5");
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
		}
	} else if (command === 'np') {
		
		if (!serverQueue) return msg.channel.send('Il n`\'y a rien à jouer.');
		return msg.channel.send(`🎶 Now playing: **${serverQueue.songs[0].title}**`);
	} else if (command === 'queue') {
        let index = "", titles = "", big_q = "";
        let server = serverQueue;
        let limit = 10;
        let numberOfSongs = !server.songs ? 0 : server.songs.length;
        let numberOfPages = Math.ceil(numberOfSongs/limit);
        let i = 0;

        if (!serverQueue.songs) {
            index += `#\n`; titles += `Nothing.\n`; big_q = "_ _\n";
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

            if (long_queue) big_q += `and ${serverQueue.songs.length - limit} more songs...\n`;
            else big_q = "_ _\n";
        }

	queue_embed = new RichEmbed()
        .addField(`Indexes`, index, true)
        .addField(`Titles`, titles, true)
        .addField(`${big_q}`, `_ _`, false)
        .setFooter(numberOfPages === 1 ? `Page [${Math.floor(i/numberOfSongs*numberOfPages)}/${numberOfPages}]` : numberOfPages === 0 ? `Page [0/0]` : `Pages [${Math.floor(i/numberOfSongs*numberOfPages)}/${numberOfPages}]`)
        .setColor([128, 66, 244]);

        msg.channel.send("", { embed: queue_embed });

	} else if (command === 'pause') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('⏸ Suspension la musique pour vous!');
		}
		return msg.channel.send('Il n\'y a rien à jouer.');
	} else if (command === 'resume') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.dispatcher.resume();
			return msg.channel.send('▶ Reprise la musique pour toi!');
		}
		return msg.channel.send('Il n\'y a rien à jouer.');
}
	return undefined;
});


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
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`Je ne pouvais pas rejoindre le channel vocal: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(`✅ **${song.title}** a été ajouté à la file d'attente!`);
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
    serverQueue.textChannel.send(`🎶 Start playing: **${serverQueue.songs[0].title}**`);


    serverQueue.dispatcher.on('end', () => {
        serverQueue.songs.shift();
		if(serverQueue.songs[0]) play(guild, connection);
		else { serverQueue.textChannel.send("Il n\'y à plus aucun son à joué.\nJe quitte le salon.");
            connection.disconnect();
            return;
		
		} });

    serverQueue.dispatcher.setVolume(serverQueue.volume / 100);

}

client.login(process.env.TOKEN);
