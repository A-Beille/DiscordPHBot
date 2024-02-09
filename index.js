/*
Information importante:
Ce projet n'est PAS organisé. Cela signifie qu'il n'a pas été fait pour être modifié, et qu'il est logique que vous ayez du mal à le lire.
Je l'ai fait en peu de temps (~1 heure, en comptant le temps de recherche d'une API, car une API PornHub qui fonctionne c'est... rare).
De plus, vu la taille du bot, ça ne nécessite pas de créer d'autres dossiers pour stocker les commandes, et tout... ç'aurait été plus qu'inutile.
*/
const Discord = require("discord.js")
const fs = require("fs")
const client = new Discord.Client({intents:[47095]})
const {PornHub} = require("pornhub.js")
const config = require("./config.json")
client.login(config.TOKEN)
let results = {}
const defdoc = fs.readFileSync("./docs/layout.html").toString()
client.on("ready",()=>{
    console.log("UWU")
    const commands = client.application.commands
    commands?.create({
        name:"search",
        description:"Recherche une vidéo sur le Hub",
        options:[{
            name:"contenu",
            description:"Le contenu de votre recherche malsaine",
            type:Discord.ApplicationCommandOptionType.String,
            required: true
        },
        {
            name:"type",
            description:"Le type de votre recherche malsaine (défaut : video)",
            type:Discord.ApplicationCommandOptionType.String
        }
    ]
    })
})
client.on("interactionCreate",(interaction)=>{
    if(!interaction.channel.nsfw) return interaction.reply({
        embeds: [new Discord.EmbedBuilder()
        .setTitle("Oops !")
        .setDescription(`En vertu des conditions d'utilisation de Discord, le fonctionnement de ce bot est réduit aux salons NSFW.\n\n# Notez que ce bot contient des contenus pornographiques inadaptés aux mineurs !`)
        .setColor("Orange")
        .setFooter({text:"PornHub Bot"})],ephemeral:true
    })
    if(interaction.isButton()){
        if(interaction.customId.startsWith("seeall")){
            let result = results[interaction.customId.split("seeall")[1]]
            //Avertissement : les résultats sont stockés dans una variable temporaire. Cela signifie que lorsque le bot redémarre, ils ne sont plus là.
            if(!result) return interaction.reply({
                embeds: [new Discord.EmbedBuilder()
                .setTitle("Oops !")
                .setDescription(`Il semble que le cache associé à ce message ait été supprimé. Relancez la recherche, puis appuyez sur le bouton sur la nouvelle recherche.`)
                .setColor("Orange")
                .setFooter({text:"PornHub Bot"})],ephemeral:true
            })
            let sample = defdoc
            result.forEach((r)=>{ //Pour chaque résultat, le "squelette" est modifié selon ce résultat, afin que votre plaisir soit immédiat uwu
                let newdoc = `<div style="display: flex;">
                <img class="thumbnail" src="${r.preview || r.photo}">
                <h2 style="margin-left: 10px;"> <a href="${r.url}">${r.title || r.name}</a></h2>
            </div><br>`
            sample+=newdoc
            })
            let filename = `./docs/${Math.floor(Math.random() * 10)}.html`
            fs.writeFileSync(`${filename}`, sample)
            interaction.reply({
                content:"Page Web générée avec tous les résultats.",
                files:[filename]
            })
        }
    }
    if(interaction.isCommand()){
        if(interaction.commandName == "search"){
            let keyword = interaction.options.getString("contenu")
            let type = interaction.options.getString("type") || "video"
            type = type.toLowerCase()
            let allowedtypes = [
                "video",
                "gif",
                "album",
                "pornstar"
            ]
            const pornhub = new PornHub()
            if(!allowedtypes.includes(type)) return interaction.reply({
                embeds: [new Discord.EmbedBuilder()
                .setTitle("Oops !")
                .setDescription(`Le type donné est invalide ! Il ne peut être compris que entre : ${allowedtypes}`)
                .setColor("Orange")
                .setFooter({text:"PornHub Bot"})],ephemeral:true
            })
            let editedtype = type.split("")
            pornhub[`search${editedtype.shift().toUpperCase()+editedtype.join("")}`](keyword).then((result)=>{
                if(!result.data[0]) return interaction.reply({
                    embeds: [new Discord.EmbedBuilder()
                    .setTitle("Oops !")
                    .setDescription(`Aucun résultat trouvé !`)
                    .setColor("Orange")
                    .setFooter({text:"PornHub Bot"})],ephemeral:true
                })
                let r = result.data[0]
                let gennumber = Math.floor(Math.random() * 10000000000)
                let row = new Discord.ActionRowBuilder()
                .addComponents(
                    new Discord.ButtonBuilder()
                    .setLabel("Y aller")
                    .setURL(r.url)
                    .setStyle(Discord.ButtonStyle.Link)
                    .setEmoji("🔞"),
                    new Discord.ButtonBuilder()
                    .setLabel("Voir tout")
                    .setCustomId(`seeall${gennumber}`)
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setEmoji("👀")
                )
                let embed = new Discord.EmbedBuilder()
    .setColor("Orange")                  
                if(type == "video") { embed.setTitle(r.title)
                .setDescription(`**Informations détaillées**`)
                .addFields({
                    name:"**Vues**", value: `${r.views}`,inline:true
                },
                {
                    name:"**Durée**", value: `${r.duration}`,inline:true
                },
                {
                    name:"**HD**", value: `${(r.hd) ? "Oui" : "Non"}`,inline:true
                },
                {
                    name:"**Premium**", value: `${(r.hd) ? "Oui" : "Non"}`,inline:true
                })
.setThumbnail(r.preview)
            }
else if(type == "pornstar"){embed.setTitle(r.name)
.setDescription(`**Informations détaillées**`)
.addFields({
    name:"**Vues**", value: `${r.views}`,inline:true
},
{
    name:"**Nombre de vidéos**", value: `${r.videoNum}`,inline:true
})
.setThumbnail(r.photo)
}
else if(type == "gif"){embed.setTitle(r.title)
    }
else if(type == "album"){embed.setTitle(r.title)
        .setDescription(`**Informations détaillées**`)
        .addFields({
            name:"**Classement**", value: `${r.rating}`,inline:true
        })
        .setThumbnail(r.preview)
        }
                interaction.reply({
                    embeds:[embed],
                components:[row]
                }).then(()=>{
                    results[gennumber] = result.data
                })
            }).catch((e)=>{
                console.log(e)
                interaction.reply({
                    embeds: [new Discord.EmbedBuilder()
                    .setTitle("Oops !")
                    .setDescription(`Aucun résultat trouvé !`)
                    .setColor("Orange")
                    .setFooter({text:"PornHub Bot"})],ephemeral:true
                })
            })

        }
    }
})