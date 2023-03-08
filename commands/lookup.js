const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const signale = require('signale');

signale.config({displayTimestamp: true, displayDate: true});

// /lookup call:W1AW
// Replies with information regarding the callsign specified

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lookup')
        .setDescription('Looks up a callsign on hamdb.')
        .addStringOption(option => 
            option.setName('call')
                .setDescription('The callsign to return')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('verbose')
                .setDescription('Include all information')),
    async execute(interaction) {
        try {
            await interaction.deferReply();

            const verbose = interaction.options.getBoolean('verbose') ?? false;
            const get = await fetch(`http://api.hamdb.org/v1/${interaction.options.getString('call')}/json/W5AC`).then((res) => res.json());
            if (get.hamdb.callsign.call === 'NOT_FOUND') {
                await interaction.editReply({content: `Call sign ${interaction.options.getString('call')} not found in HamDB!`});
                return;
            }
            
            // Handle the name correctly
            let ham_name = get.hamdb.callsign.name;
            let given_name = get.hamdb.callsign.fname;
            let middle_init = get.hamdb.callsign.mi;
            let suffix = get.hamdb.callsign.suffix;

            if (middle_init !== '')
                ham_name = `${given_name} ${middle_init}. ${ham_name} ${suffix}`;
            else if (given_name !== '')
                ham_name = `${given_name} ${ham_name} ${suffix}`;

            // Different class types
            let license_class;
            switch (get.hamdb.callsign.class) {
                case 'E':
                    license_class = 'Amateur Extra';
                    break;
                case 'G':
                    license_class = 'General';
                    break;
                case 'T':
                    license_class = 'Technician';
                    break;
                case '':
                    license_class = 'Club';
                    break;
                default:
                    license_class = 'Other';
                    break;
            }

            // Status
            let ham_status;
            switch (get.hamdb.callsign.status) {
                case 'A':
                    ham_status = 'Active';
                    break;
                default:
                    ham_status = 'Inactive';
                    break;
            }


            let embed = new EmbedBuilder()
                .setColor(0x500000)
                .setTitle(`Record for ${get.hamdb.callsign.call}`)
                .setDescription(`[See ${get.hamdb.callsign.call} on QRZ](https://www.qrz.com/db/?callsign=${get.hamdb.callsign.call})`)
                .setAuthor({name: 'HamDB Database'})
                .setURL(`http://hamdb.org/${get.hamdb.callsign.call}`)
                .addFields(
                    {name: 'Name: ', value: ham_name},
                    {name: 'Class: ', value: license_class, inline: true},
                    {name: 'Status: ', value: ham_status, inline: true},
                    {name: 'Grid: ', value: get.hamdb.callsign.grid, inline: true},
                )
                .setTimestamp()

            if(verbose) {
                let address = `${get.hamdb.callsign.addr1}\n${get.hamdb.callsign.addr2}, ${get.hamdb.callsign.state}, ${get.hamdb.callsign.country} ${get.hamdb.callsign.zip}`
                embed.addFields(
                    {name: 'Expires:', value: get.hamdb.callsign.expires, inline: true},
                    {name: 'Latitude:', value: get.hamdb.callsign.lat, inline: true},
                    {name: 'Longitude:', value: get.hamdb.callsign.lon, inline: true},
                    {name: 'Address:', value: address}
                )
            }
            await interaction.editReply({ embeds: [embed] });
        } catch(error) {
            signale.error(error);
        }
    },
};