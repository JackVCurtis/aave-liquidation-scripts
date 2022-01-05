const fs = require('fs')
const path = require('path')

module.exports = async function loadUsers(web3) {
    const users = {}
    const eventDirName = path.join(__dirname, '..', '..', 'data', 'events')
    const dir = fs.readdirSync(eventDirName)
    
    for (let file of dir) {
        const events = JSON.parse(fs.readFileSync(path.join(eventDirName, file)))
        for (let data of events) {
            users[data.event.user] = new web3.utils.BN(users[data.event.user] || '0').add(new web3.utils.BN(data.event.amount))
        }
    }

    let usersStr = ''
    for (let user in users) {
        let userStr = `${user},${web3.utils.fromWei(users[user], 'ether')}\n`
        console.log(userStr)
        usersStr += userStr
    }

    fs.writeFileSync(path.join(__dirname, '..', '..', 'data', 'users', 'index.csv'), usersStr)
}