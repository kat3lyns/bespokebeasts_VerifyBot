const { Modal, MessageActionRow, TextInputComponent, MessageButton, MessageEmbed } = require("discord.js");
const settings = require('../../settings.json');

const waitingToSubmit = {};

const ageForm = new Modal()
.setTitle("Verification Questions")
.setCustomId("submit-age")
.setComponents(
new MessageActionRow().setComponents(
    new TextInputComponent()
    .setCustomId("age")
    .setLabel("Your Age")
    .setPlaceholder("How old are you?")
    .setStyle("SHORT")
    .setRequired(true)
));

const sourceForm = new Modal()
.setTitle("Verification Questions")
.setCustomId("submit-source")
.setComponents(
new MessageActionRow().setComponents(
    new TextInputComponent()
    .setCustomId("source")
    .setLabel("Where did you find us?")
    .setPlaceholder("YouTube, Google, Referral, Etc")
    .setStyle("SHORT")
    .setRequired(true)
));

const furryForm = new Modal()
.setTitle("Verification Questions")
.setCustomId("submit-furry")
.setComponents(
new MessageActionRow().setComponents(
    new TextInputComponent()
    .setCustomId("furry")
    .setLabel("Are you a furry?")
    .setPlaceholder("yes or no")
    .setStyle("SHORT")
    .setRequired(true)
));

const bioForm = new Modal()
.setTitle("Verification Questions")
.setCustomId("submit-bio")
.setComponents(
new MessageActionRow().setComponents(
    new TextInputComponent()
    .setCustomId("bio")
    .setLabel("Let us know about yourself")
    .setPlaceholder("What are you into? What games do you play? etc")
    .setStyle("PARAGRAPH")
    .setRequired(true)
));

const pwForm = new Modal()
.setTitle("Verification Questions")
.setCustomId("submit-pw")
.setComponents(
new MessageActionRow().setComponents(
    new TextInputComponent()
    .setCustomId("pw")
    .setLabel("What is the password?")
    .setPlaceholder("Hint hint, it's in the rules!")
    .setStyle("SHORT")
    .setRequired(true)
));

module.exports = {
    eventName: 'interactionCreate',
    run: async(client, interaction) => {
        if(interaction.isButton()) {
            const interaction2 = client.interactions.get(interaction.member.id);
            console.log(interaction2);

            if(interaction.customId == "accept") {
                if(!interaction.member.roles.cache.get(settings.staff_role)) return interaction.reply({ content: "You can't use this!", ephemeral: true });
                await interaction.deferReply({ ephemeral: true });                

                const embed = interaction.message.embeds[0];
                const member = interaction.guild.members.cache.get(embed.footer.text);
                embed.setColor("#53CB57");
                embed.setAuthor({ name: "Approved Request", iconURL: member.displayAvatarURL() });
                const role = interaction.guild.roles.cache.get(settings.verified_role);
                await member.roles.add(role);
                await member.send("Your request got approved! Welcome to the server.");

                const channel = client.channels.cache.get(settings.archive_channel);
                await channel.send({ embeds: [ embed ] });
                await interaction.editReply({ content: "Done!", ephemeral: true });
                try {
                    await interaction.message.delete();
                } catch(error) {
                    console.log(error);
                }
            } else if(interaction.customId == "reject") {
                if(!interaction.member.roles.cache.get(settings.staff_role)) return interaction.reply({ content: "You can't use this!", ephemeral: true });
                await interaction.deferReply({ ephemeral: true });

                const embed = interaction.message.embeds[0];
                const member = interaction.guild.members.cache.get(embed.footer.text);
                embed.setColor("#CB5353");
                embed.setAuthor({ name: "Rejected Request", iconURL: member.displayAvatarURL() });
                await member.send("Your request didn't get approved!");

                const channel = client.channels.cache.get(settings.archive_channel);
                await channel.send({ embeds: [ embed ] });
                await interaction.editReply({ content: "Done!", ephemeral: true });
                await interaction.message.delete();
            } else if(interaction.customId == "verify-no") {
                delete waitingToSubmit[`${interaction.member.id}`];
                await interaction.update({ content: "Cancelled your verification request. Feel free to start it again by continuing from where you left off or making a new request by /verify.", ephemeral: true });
            } else if (interaction.customId == "verify-yes") {
                const embed = new MessageEmbed();
                embed.setAuthor({ name: "Pending Verification", iconURL: interaction.member.displayAvatarURL() });
                embed.setColor("#9531F2");
                embed.setTimestamp(new Date());
                embed.addFields([
                    { name: "Discord User", value: `<@${interaction.member.id}>`, inline: true },
                    { name: "Age", value: `${waitingToSubmit[interaction.member.id]['age']}`, inline: true },
                    { name: "Where they found us", value: `${waitingToSubmit[interaction.member.id]['source']}`, inline: true },
                    { name: "Is a furry", value: `${waitingToSubmit[interaction.member.id]['furry']}`, inline: true },
                    { name: "Information about them", value: `${waitingToSubmit[interaction.member.id]['bio']}`, inline: true },
                    { name: "The password", value: `${waitingToSubmit[interaction.member.id]['pw']}`, inline: true }
                ])
                embed.setFooter({ text: interaction.member.id });

                const actionRow = new MessageActionRow();
                actionRow.addComponents(
                    new MessageButton()
                    .setStyle("SUCCESS")
                    .setEmoji("✅")
                    .setLabel("Accept")
                    .setCustomId("accept"),
                    new MessageButton()
                    .setStyle("DANGER")
                    .setEmoji("⛔")
                    .setLabel("Reject")
                    .setCustomId("reject")
                );

                const channel = client.channels.cache.get(settings.approve_deny_channel);
                await channel.send({ embeds: [ embed ], components: [ actionRow ] });

                delete waitingToSubmit[`${interaction.member.id}`];
                await interaction.update({ components: [], content: "Thank you for sending a verification request! Please wait as our staff members review your request.", ephemeral: true });
            } else {
                if(waitingToSubmit[`${interaction.member.id}`] == null) {
                    waitingToSubmit[`${interaction.member.id}`] = { };
                    waitingToSubmit[`${interaction.member.id}`]['age'] = '';
                    waitingToSubmit[`${interaction.member.id}`]['source'] = '';
                    waitingToSubmit[`${interaction.member.id}`]['furry'] = '';
                    waitingToSubmit[`${interaction.member.id}`]['bio'] = '';
                    waitingToSubmit[`${interaction.member.id}`]['pw'] = '';
                }
                
                switch(interaction.customId) {
                    case "verify-age": {
                        await interaction.showModal(ageForm);
                        break;
                    } case "verify-source": {
                        await interaction.showModal(sourceForm);
                        break;
                    } case "verify-furry": {
                        await interaction.showModal(furryForm);
                        break;
                    } case "verify-bio": {
                        await interaction.showModal(bioForm);
                        break;
                    } case "verify-password": {
                        await interaction.showModal(pwForm);
                        break;
                    } 
                }
            }
        }
        if(interaction.isModalSubmit()) {
            switch(interaction.customId) {
                case "submit-age": {
                    waitingToSubmit[`${interaction.member.id}`]['age'] = interaction.fields.getTextInputValue("age");
                    break;
                } case "submit-source": {
                    waitingToSubmit[`${interaction.member.id}`]['source'] = interaction.fields.getTextInputValue("source");
                    break;
                } case "submit-furry": {
                    waitingToSubmit[`${interaction.member.id}`]['furry'] = interaction.fields.getTextInputValue("furry");
                    break;
                } case "submit-bio": {
                    waitingToSubmit[`${interaction.member.id}`]['bio'] = interaction.fields.getTextInputValue("bio");
                    break;
                } case "submit-pw": {
                    waitingToSubmit[`${interaction.member.id}`]['pw'] = interaction.fields.getTextInputValue("pw");
                    break;
                } 
            }

            const firstActionRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("verify-age")
                    .setStyle(waitingToSubmit[`${interaction.member.id}`]['age'] == "" ? "SECONDARY" : "PRIMARY")
                    .setLabel("What's your age?"),
                new MessageButton()
                    .setCustomId("verify-source")
                    .setStyle(waitingToSubmit[`${interaction.member.id}`]['source'] == "" ? "SECONDARY" : "PRIMARY")
                    .setLabel("Where did you find us?"),
                new MessageButton()
                    .setCustomId("verify-furry")
                    .setStyle(waitingToSubmit[`${interaction.member.id}`]['furry'] == "" ? "SECONDARY" : "PRIMARY")
                    .setLabel("Are you a furry?"),
                new MessageButton()
                    .setCustomId("verify-bio")
                    .setStyle(waitingToSubmit[`${interaction.member.id}`]['bio'] == "" ? "SECONDARY" : "PRIMARY")
                    .setLabel("Tell us about yourself"),
                new MessageButton()
                    .setCustomId("verify-password")
                    .setStyle(waitingToSubmit[`${interaction.member.id}`]['pw'] == "" ? "SECONDARY" : "PRIMARY")
                    .setLabel("What's the password?"),
            );
            const secondActionRow = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("verify-yes")
                    .setStyle("SUCCESS")
                    .setLabel("Submit")
                    .setDisabled(
                        waitingToSubmit[`${interaction.member.id}`]['age'] == "" || 
                        waitingToSubmit[`${interaction.member.id}`]['source'] == "" ||
                        waitingToSubmit[`${interaction.member.id}`]['furry'] == "" ||
                        waitingToSubmit[`${interaction.member.id}`]['bio'] == "" ||
                        waitingToSubmit[`${interaction.member.id}`]['pw'] == ""
                        ? true
                        : false
                        ),
                new MessageButton()
                    .setCustomId("verify-no")
                    .setStyle("DANGER")
                    .setLabel("Cancel"),
            );
            await interaction.update({ components: [ firstActionRow, secondActionRow ], ephemeral: true });
        }
    }
}