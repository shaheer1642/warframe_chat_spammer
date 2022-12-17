
const fs = require('fs')
const os = require('os')
const eeLogPath = os.homedir() + '/AppData/Local/Warframe/EE.log'
const dataJsonPath = './data.json'
const { WebhookClient } = require('discord.js');
const webhook_client = new WebhookClient({url: process.env.WEBHOOK_URL})

// read-file every 5s
setInterval(() => {
    read_log()
}, 5000);

setInterval(update_data_json, 10000);

if (!fs.existsSync(dataJsonPath)) fs.writeFileSync(dataJsonPath,JSON.stringify({last_parse_time : -1}))
var last_parse_time = JSON.parse(fs.readFileSync(dataJsonPath,'utf-8')).last_parse_time

var last_read_line_index = -1
var game_start_time = null
function read_log() {
    fs.readFile(eeLogPath, 'utf8', (err, data) => {
        if (err) return
        const lines = data.split('\n')
        for (const [index,line] of lines.entries()) {
            if (!game_start_time && line.match('Current time: ')) {
                const words = line.split(' ')
                game_start_time = new Date(`${words[5]} ${words[6]} ${words[7]} ${words[8]} ${words[9]}`).getTime()
            }
            if (index <= last_read_line_index) continue
            if (!Number(line.split(' ')[0])) continue
            const parse_time = game_start_time + Number(line.split(' ')[0].replace('.',''))
            if (parse_time < last_parse_time) continue
            //console.log('read line no',index,Number(line.split(' ')[0]),new Date(parse_time))
            if (line.match('IRC out: PRIVMSG')) {
                webhook_client.send({
                    embeds: [{
                        title: 'Sent new message',
                        description: `**Channel ${line.split(' ')[6]}**\n${line.split(`${line.split(' ')[6]} :`)[1].replace(/_/g,'\_')}`,
                        color: '#43d96b'
                    }]
                }).catch(console.error)
            }
            if (line.match('ChatRedux.lua: ChatRedux::AddTab:')) {
                const sender = line.split(' ')[10]
                if (!['R_EN_EU','T_EN_EU_WIN','Q_EN_EU','R_EN_NA','T_EN_NA_WIN','Q_EN_NA','R_EN_ASIA','T_EN_ASIA_WIN','Q_EN_ASIA'].includes(sender)) {
                    webhook_client.send({
                        embeds: [{
                            title: 'Received new private message',
                            description: `**Sender: ${sender}**`,
                            color: '#d95743'
                        }]
                    }).catch(console.error)
                }
            }
            last_read_line_index = index
            last_parse_time = parse_time
        }
    })
}

function update_data_json() {
    fs.writeFileSync(dataJsonPath, JSON.stringify({
        last_parse_time: last_parse_time
    }))
}
