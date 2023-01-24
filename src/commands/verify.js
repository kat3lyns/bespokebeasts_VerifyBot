const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    commandData: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Verify yourself!")
        .toJSON(),
    run: async(client, interaction) => {
        const firstActionRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("verify-age")
                .setStyle("SECONDARY")
                .setLabel("What's your age?"),
            new MessageButton()
                .setCustomId("verify-source")
                .setStyle("SECONDARY")
                .setLabel("Where did you find us?"),
            new MessageButton()
                .setCustomId("verify-furry")
                .setStyle("SECONDARY")
                .setLabel("Are you a furry?"),
            new MessageButton()
                .setCustomId("verify-bio")
                .setStyle("SECONDARY")
                .setLabel("Tell us about yourself"),
            new MessageButton()
                .setCustomId("verify-password")
                .setStyle("SECONDARY")
                .setLabel("What's the password?"),
        );
        const secondActionRow = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("verify-yes")
                .setStyle("SUCCESS")
                .setLabel("Submit")
                .setDisabled(true),
            new MessageButton()
                .setCustomId("verify-no")
                .setStyle("DANGER")
                .setLabel("Cancel"),
        );
        await interaction.reply({ components: [ firstActionRow, secondActionRow ], ephemeral: true });
        client.interactions.set(interaction.member.id, interaction);
    }
}