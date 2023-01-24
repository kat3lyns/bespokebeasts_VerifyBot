const Discord = require('discord.js');
const client = new Discord.Client({ intents: [
    Discord.Intents.FLAGS.GUILDS, 
    Discord.Intents.FLAGS.GUILD_MEMBERS, 
    Discord.Intents.FLAGS.GUILD_MESSAGES, 
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGES
    ],
    partials: [
        "CHANNEL",
        "REACTION",
        "GUILD_MEMBER",
        "MESSAGE",
        "USER",
    ]
});
const settings = require('./settings.json');

const glob = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);

const buttonsCollection = new Discord.Collection();
const commandsCollection = new Discord.Collection();
client.interactions = new Discord.Collection();

client.setMaxListeners(20);
client.on("ready", async() => {
    console.log(`Bot logged in, loading the handlers...`);

    const commands = client.guilds.cache.get(settings.guild_id)?.commands;
    if(!commands) return console.log("The commands couldn't be loaded.");

    // button
    const buttonFiles = await globPromise("./src/buttons/**/*.js");
    buttonFiles.map((buttonFiles) => {
        const button = require(buttonFiles);
        const buttonData = button.buttonData;
        buttonsCollection.set(buttonData.custom_id, button);
    });

    // commands
    const commandFiles = await globPromise("./src/commands/**/*.js");
    commandFiles.map((commandFile) => {
        const command = require(commandFile);
        const commandData = command.commandData;
        commands.create(commandData).then(() => console.log(`Loaded command ${commandFile}`));
        commandsCollection.set(commandData.name, command);
    });

    // events
    const eventFiles = await globPromise("./src/events/**/*.js");
    eventFiles.map((eventFile) => {
        const event = require(eventFile);
        client.on(`${event.eventName}`, (...args) => event.run(client, ...args));
        console.log(`Loaded event ${eventFile}`);
    });

    // schedulers
    const schedulerFiles = await globPromise("./src/schedulers/**/*.js");
    schedulerFiles.map((schedulerFile) => {
        require(schedulerFile)(client);
        console.log(`Loaded scheduler ${schedulerFile}`);
    });
});

client.on("interactionCreate", async(interaction) => {
    if(interaction.isButton()) {
        if(buttonsCollection.has(interaction.customId)) buttonsCollection.get(interaction.customId).run(client, interaction);
    }
    else if(interaction.isCommand() || interaction.isAutocomplete()) {
        if(commandsCollection.has(interaction.commandName)) commandsCollection.get(interaction.commandName).run(client, interaction);
    }
});

(async() => {
    client.login(settings.bot_token);
})()