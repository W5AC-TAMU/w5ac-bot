const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const path = require('node:path');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// Repeater Audio Streaming
// Streams repeater audio from broadcastify to voice channel

module.exports = {
	configFile: null,
	client: null,
	init: function(client, config) {
		this.client = client;
		this.configFile = config;
		this.audio(this.client.channels.cache.find(ch => ch.name === this.configFile.stream_chan), config.stream_url, 1);
	},
	// Post questions
	audio: function(channel, track, volume) {
		const connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guildId,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});
		const player = createAudioPlayer();

		resource = createAudioResource(path.join(__dirname, track), { inlineVolume: true });
		resource.volume.setVolume(volume);
		connection.subscribe(player);
		player.play(resource)
		connection.on(VoiceConnectionStatus.Ready, () => {console.log("ready"); player.play(resource);})
		connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
			try {
				console.log("Disconnected.")
				await Promise.race([
					entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
					entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
				]);
			} catch (error) {
				connection.destroy();
			}
		});
		player.on('error', error => {
			console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			player.play(getNextResource());
		});
		player.on(AudioPlayerStatus.Playing, () => {
			console.log('The audio player has started playing!');
		}); 
		player.on('idle', () => {
			connection.destroy();
		})
	}
}