const fs = require('fs')
const path = require('path')
const LendingPoolV2Artifact = require('@aave/protocol-v2/artifacts/contracts/protocol/lendingpool/LendingPool.sol/LendingPool.json');

module.exports = async function getUserAccountData(web3) {
    const lendingPool = new web3.eth.Contract(LendingPoolV2Artifact.abi, '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9')
    const userPath = path.join(__dirname, '..', '..', 'data', 'users')
    const csvStr = fs.readFileSync(path.join(userPath, 'index.csv')) 
    const rows = csvStr.toString().split('\n')
    const users = rows.map(r => r.split(',')[0])
    const unhealthyAccounts = []
    for (let user of users) {
        if (user.length) {
            const userAccountData = await lendingPool.methods.getUserAccountData(user).call()
            userAccountData.user = user
            console.log(`Fetched data for user: ${user}`)
            if (new web3.utils.BN(userAccountData.healthFactor).lt(new web3.utils.BN('1'))) {
                unhealthyAccounts.push(userAccountData)
                console.log('Added Unhealthy Account: ', userAccountData)
            }                
        }
    }

    fs.writeFileSync(path.join(userPath, 'unhealthy.json'), JSON.stringify(unhealthyAccounts, null, 4))
}