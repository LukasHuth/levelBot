const settings = require('./settings.json');
const request = require('request');
const http = require('http');
const Discord = require('discord.js');
const { MessageAttachment } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const bot = new Discord.Client();
// console.log(settings.api.token);

const hostname = "127.0.0.1";
const port = 8001;

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.username}`);
});

async function downloadImage (url, _path) {  
    const path_1 = `./images/`+_path;
    const writer = fs.createWriteStream(path_1)
  
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })
  
    response.data.pipe(writer)
  
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}  

bot.on('message', async message => {
    if(message.author.bot) return;

    if(message.content.startsWith("rank")) {
        // request rank
        res = {
            level: 7,
            xp: 1500,
            missing: 150,
            rank: 1 
        }
        options = {
            hostname : "localhost",
            port: 8001,
            path: '/v1/user/'+message.guild.id+'/'+message.author.id,
            method: 'GET'
        };
        // console.log(options);
        req = http.request(options, resp => {
            // console.log("test");
            // console.log(resp);
            resp.on('data', async data => {
                data = data.toString();
                data = JSON.parse(data);
                // console.log(data);
                res = data;
                message.channel.send(`You're on Rank ${res.rank} with Level ${res.level} with ${res.xp}xp and ${res.missing}xp to the  next Level!`);
            });
        });

        req.on('error', error => {
            console.error(error)
        });

        req.end();
        return;
    }
    if(message.content.startsWith("level")) {
        // request data
        res = {
            level: 7,
            xp: 1500,
            missing: 150,
            rank: 100,
            required: 400
        }
        options = {
            hostname : "localhost",
            port: 8001,
            path: '/v1/user/'+message.guild.id+'/'+message.author.id,
            method: 'GET'
        };
        // console.log(options);
        req = http.request(options, resp => {
            // console.log("test");
            // console.log(resp);
            resp.on('data', async data => {
                data = data.toString();
                data = JSON.parse(data);
                // console.log(data);
                res = data;
                // create canvas
                const width = 600;
                const height = 200;
                const canvas = createCanvas(width, height);
                const context = canvas.getContext("2d");
                // edit canvas
                context.fillStyle = '#5F5F5F';
                context.fillRect(0, 0, width, height);
                context.font = 'bold 25pt Sans';
                // context.textAlign = 'center';
                context.fillStyle = '#3F3F3F';
                barwidth = width-50-((height-100)*2);
                // console.log(barwidth);
                context.fillRect((height-100)*2, (height/5)*4, barwidth, (height/5)*0.75);
                context.fillStyle = '#FFF';
                barwidth = (width-50-((height-100)*2))*((res.required-res.missing)/res.required);
                // console.log((res.required/(res.required-res.missing)));
                // console.log(res);
                // console.log(barwidth);
                context.fillRect((height-100)*2, (height/5)*4, barwidth, (height/5)*0.75);
                context.fillText(message.author.tag, (height-100)*2, (height/5)*2);
                context.fillText(`${(res.required-res.missing)}xp / ${res.required}xp`, (height-100)*2, (height/10)*7);
                context.font = 'bold 15pt Sans';
                // context.textAlign = 'center';
                context.fillText("RANK", width/2, (height/5)*1);
                context.font = 'bold 20pt Sans';
                context.fillText("#"+res.rank, width/2+50+10, (height/5)*1);
                context.font = 'bold 15pt Sans';
                context.fillText("LEVEL", width/2+50+50+50, (height/5)*1);
                context.font = 'bold 20pt Sans';
                context.fillText(""+res.level, width/2+50+50+50+50+10, (height/5)*1);
                // save canvas
                const url = message.author.displayAvatarURL({ format: "png" });
                const path = `avatar/${message.author.id}.png`;
        
                await downloadImage(url, path);
                const avatar = await loadImage(`./images/avatar/${message.author.id}.png`);
                context.drawImage(avatar, (height-100)/2, (height-100)/2, 100, 100)
                const buffer = canvas.toBuffer('image/png');
                fs.writeFileSync('./images/usercard/'+message.author.id+'.png', buffer);
                const attatchment = new MessageAttachment(canvas.toBuffer('image/png'), "level.png");
                message.channel.send(attatchment);
        
                message.channel.send("a");
            })
        })

        req.on('error', error => {
            console.error(error)
        });

        req.end();
        return;
    }
    if(message.content.startsWith("ban")) {
        channels = JSON.parse(fs.readFileSync('./channels.json'));
        if(!channels.hasOwnProperty(message.guild.id)) channels[message.guild.id+''] = {};
        if(!channels[message.guild.id+''].hasOwnProperty("banned")) channels[message.guild.id+'']["banned"] = [];
        if(!channels[message.guild.id+'']["banned"].includes(message.channel.id)) {
            channels[message.guild.id+'']["banned"][channels[message.guild.id+'']["banned"].length] = message.channel.id;
        }
        fs.writeFileSync("./channels.json", JSON.stringify(channels));
        return;
    }
    // add xp
    options = {
        hostname : "localhost",
        port: 8001,
        path: '/v1/user/'+message.guild.id+'/'+message.author.id,
        method: 'PUT'
    };
    channels = JSON.parse(fs.readFileSync('./channels.json'));
    if(!channels.hasOwnProperty(message.guild.id)) channels[message.guild.id+''] = {};
    if(!channels[message.guild.id+''].hasOwnProperty("banned")) channels[message.guild.id+'']["banned"] = [];
    if(!channels[message.guild.id+'']["banned"].includes(message.channel.id)) {
        fs.writeFileSync("./channels.json", JSON.stringify(channels));
    }
    if(!channels[message.guild.id+'']["banned"].includes(message.channel.id)) {
        req = http.request(options, resp => {
            resp.on('data', async data => {
                data = data.toString();
                data = JSON.parse(data);
                if(resp.statusCode == 202) {
                    message.channel.send(`GG <@${message.author.id}> you're now level ${data.level}`);
                }
                // console.log(resp.statusCode);
            });
        });
        req.on('error', error => {
            console.error(error)
        });
        req.end();
    }
});

bot.login(settings.discord.token);