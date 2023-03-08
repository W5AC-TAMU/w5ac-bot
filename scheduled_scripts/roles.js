const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// Role bot
// Posts role message in channel specified by config. Updates member roles based on button interaction

module.exports = {
    configFile: null,
    client: null,
    init: function(client, config) {
        this.client = client;
        this.configFile = config;
    },
    roleMessage: async function() {
        try {
            let channel = this.client.channels.cache.find(ch => ch.name === this.configFile.role_chan);
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('role-class-tech')
                        .setLabel('Technician')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('role-class-general')
                        .setLabel('General')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('role-class-extra')
                        .setLabel('Extra')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('role-extra-net')
                        .setLabel('Net Controller')
                        .setStyle(ButtonStyle.Primary),
                );

            const embed = new EmbedBuilder()
                .setColor(0x500000)
                .setTitle('Roles')
                .setDescription('Click the roles that corespond to your license class and optional channels');

            await channel.send({embeds: [embed], components: [row] });
        } catch(error) {
            signale.error(error);
        }
    },
    update: async function(interaction) {
        await interaction.deferReply({ephemeral: true});
        switch(interaction.customId) {
            case 'role-class-tech':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "Technician").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                } else {
                    try {
                        interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "General"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                }
                break;
            case 'role-class-general':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "General").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "General"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                } else {
                    try {
                        interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "General"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                }
                break;
            case 'role-class-extra':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "Extra").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                } else {
                    try {
                        interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Extra"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Technician"));
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "General"));
                        await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                }
                break;
            case 'role-extra-net':
                if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "Net Controller").id)) {
                    try {
                        interaction.member.roles.remove(interaction.guild.roles.cache.find(role => role.name === "Net Controller"));
                        await interaction.followUp({ content: 'Successfully removed role!', ephemeral: true });
                    } catch(error) {
                        signale.error(error);
                    }
                } else {
                    try {
                        if (interaction.member.roles.cache.has(interaction.guild.roles.cache.find(role => role.name === "W5AC Member").id)) {
                            interaction.member.roles.add(interaction.guild.roles.cache.find(role => role.name === "Net Controller"));
                            await interaction.followUp({ content: 'Successfully added role!', ephemeral: true });
                        } else {
                            await interaction.followUp({ content: 'Only W5AC members can be net controllers', ephemeral: true })
                        }
                    } catch(error) {
                        signale.error(error);
                    }
                }
                break;
            default:
                await interaction.followUp({ content: 'Can\'t find role', ephemeral: true});
                signale.debug(`Role button id ${interaction.customId} not found`);
        }
    }
   };
