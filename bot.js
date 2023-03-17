// W5AC Bot
// NPM imports
const fs = require('node:fs');
const path = require('node:path');
const signale = require('signale');
const { Client, Events, GatewayIntentBits, REST, Routes, EmbedBuilder, Collection } = require('discord.js');

// Scheduled scripts
const examQuestion = require('./scheduled_scripts/exam-question');
const roles = require('./scheduled_scripts/roles');

// Config
var configFile;
signale.config({ displayTimestamp: true, displayDate: true });
try {
	configFile = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
} catch(error) {
	signale.error(error);
}

// Discord client
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers]});


// Load Discord commands from .js files in commands directory
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// If command has options data and execution function, add it to commands at runtime, else warn about command
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		signale.warn(`The command at ${filePath} is missing a required 'data' or 'execute' property.`);
	}
}

// Run when bot is logged in
client.on('ready', () => {
	signale.success(`Logged in as ${client.user.tag}`)
	examQuestion.init(client, configFile);
	roles.init(client, configFile);
});

// Runs on command, button press, or other interaction
client.on(Events.InteractionCreate, async interaction => {
	// If command, check for errors, then run command
	if(interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if(!command) {
			var error = new Error(`Command ${interaction.commandName} not found`);
			signale.error(error);
			return;
		}
		try {
			var user = interaction.guild != null ? interaction.guild.members.cache.find(member => member.id === interaction.user.id).displayName : interaction.user.username;
			signale.debug(`Command ${interaction.commandName} by user ${user}`);
			await command.execute(interaction);
		} catch(error) {
			signale.error(error);
			await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
		}
		// If button press, check for errors, then run corresponding handler
	} else if(interaction.isButton()) {
		signale.debug(`Button ${interaction.customId} pressed by user ${interaction.guild.members.cache.find(member => member.id === interaction.user.id).displayName}`);
		try {
			if(interaction.customId.includes('exam')) {
				examQuestion.answers(interaction);
			} else if(interaction.customId.includes('role')) {
				roles.update(interaction);
			}
		} catch(error) {
			signale.error(error);
		}
	}
});

// Runs when a user is added to a server
client.on('guildMemberAdd', async member => {
	signale.debug(`${member.user.username} joined a server the bot is in.`);
	try {
		let mod_embed = new EmbedBuilder()
			.setColor(0x5B6236)
			.setTimestamp()
			.addFields({name: 'New Member Joined!', value: member.user.tag});
		let channel = client.channels.cache.find(ch => ch.name === configFile.log_chan);
		channel.send({ embeds: [mod_embed] });

		channel = client.channels.cache.find(ch => ch.name === 'welcome');
		let rules_channel = client.channels.cache.find(ch => ch.name === 'rules')
		channel.send(`Everyone welcome <@${member.user.id}>! ${member.user.username}, please read <#${rules_channel.id}> and set your nickname!`)

	} catch(error) {
		signale.error(error);
	}
});

// Runs when messages are deleted
client.on('messageDelete', async message => {
	signale.debug(`Message by ${message.guild.members.cache.find(member => member.id === message.author.id).displayName} deleted in #${message.channel.name}`);
	try {
		if (message.author.bot) return;
		if (message.content === '') return;
		let channel = client.channels.cache.find(ch => ch.name === configFile.log_chan);
		const embed = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle(`:wastebasket: Message Delete in #${message.channel.name}`)
			.setAuthor({name: message.author.username})
			.setDescription(`Deleted on ${new Date().toString()}`)
			.addFields({name: 'Message content', value: `\`\`\`${message.content}\`\`\``});
		channel.send({embeds: [embed]});
	} catch(error) {
		signale.error(error);
	}
	signale.debug(`Message by ${message.guild.members.cache.find(member => member.id === message.author.id).displayName} deleted in #${message.channel.name}`);
	try {
		if (message.author.bot) return;
		if (message.content === '') return;
		let channel = client.channels.cache.find(ch => ch.name === configFile.log_chan);
		const embed = new EmbedBuilder()
			.setColor(0xFF0000)
			.setTitle(`:wastebasket: Message Delete in #${message.channel.name}`)
			.setAuthor({ name: message.author.username })
			.setDescription(`Deleted on ${new Date().toString()}`)
			.addFields({ name: 'Message content', value: `\`\`\`${message.content}\`\`\`` });
		channel.send({ embeds: [embed] });
	} catch (error) {
		signale.error(error);
	}
});

// Run the bot
try {
	client.login(configFile.token);
} catch(error) {
	signale.fatal('Login failed. The token that you put in is most likely invalid.');
	process.exit(1);
}
