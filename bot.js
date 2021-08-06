const settings = require('./settings.json');
const request = require('request');
const Discord = require('discord.js');
const { MessageAttachment } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const bot = new Discord.Client();
console.log(settings.api.token);

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
        message.channel.send(`You're on Rank ${res.rank} with Level ${res.level} with ${res.xp}xp and ${res.missing}xp to the  next Level!`);
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
        context.fillText(message.author.tag, (height-100)*2, (height/5)*3);
        context.font = 'bold 15pt Sans';
        // context.textAlign = 'center';
        context.fillText("RANK", width/2, (height/5)*2);
        context.font = 'bold 20pt Sans';
        context.fillText("#"+res.rank, width/2+50+10, (height/5)*2);
        context.font = 'bold 15pt Sans';
        context.fillText("LEVEL", width/2+50+50+50, (height/5)*2);
        context.font = 'bold 20pt Sans';
        context.fillText(""+res.level, width/2+50+50+50+50+10, (height/5)*2);
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

        // loadImage(`./images/avatar/${message.author.id}.png`).then(image => {
        //     context.drawImage(image, 10, 10, 70, 70)
        //     const buffer = canvas.toBuffer('image/png');
        //     fs.writeFileSync('./images/usercard/'+message.author.id+'.png', buffer);
        // })
        // const buffer = canvas.toBuffer('image/png');
        // fs.writeFileSync('./usercard'+message.author.id+'.png', buffer);
    }
});

bot.login(settings.discord.token);