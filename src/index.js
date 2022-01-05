require('dotenv').config()
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const AaveProtocolDataProvider = require('@aave/protocol-v2/artifacts/contracts/misc/AaveProtocolDataProvider.sol/AaveProtocolDataProvider.json')
const AWSHttpProvider = require('./aws-http-provider');
const loadUsers = require('./functions/load-users');
const getUserAccountData = require('./functions/get-user-account-data');

async function main() {
    const web3 = new Web3(new AWSHttpProvider('https://nd-xu75nj3h6rbllfkh2xlvkbeqd4.ethereum.managedblockchain.us-east-1.amazonaws.com'))
    const assets = {}
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'users', 'unhealthy.json')))
    
    const protocolDataProvider = new web3.eth.Contract(AaveProtocolDataProvider.abi, '0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d')
    const tokens = await protocolDataProvider.methods.getAllReservesTokens().call()
    for (let token of tokens) {
        assets[token.symbol] = {
            address: token.tokenAddress
        }
    }

    const usersWithCollateral = []

    for (let userData of users) {
        for (let assetKey of Object.keys(assets)) {
            const asset = assets[assetKey]
            const userReserveData = await protocolDataProvider.methods.getUserReserveData(asset.address, userData.user).call()
            if (userReserveData.currentATokenBalance != '0') {
                userData.reserveData = {
                    [assetKey]: { 
                        currentATokenBalance: userReserveData.currentATokenBalance,
                        currentStableDebt: userReserveData.currentStableDebt,
                        currentVariableDebt: userReserveData.currentVariableDebt,
                        principalStableDebt: userReserveData.principalStableDebt,
                        scaledVariableDebt: userReserveData.scaledVariableDebt,
                        stableBorrowRate: userReserveData.stableBorrowRate,
                        liquidityRate: userReserveData.liquidityRate,
                        stableRateLastUpdated: userReserveData.stableRateLastUpdated,
                        usageAsCollateralEnabled: userReserveData.usageAsCollateralEnabled,
                    }
                }
                usersWithCollateral.push(userData)
                console.log(`Found user with collateral: ${userData.reserveData[assetKey].currentATokenBalance} - ${assetKey}`)
            } else {
                console.log(`No collateral for user: ${userData.user}, asset: ${assetKey}`)
            }
        }
    }
    console.log(usersWithCollateral)
    fs.writeFileSync(path.join(__dirname, '..', 'data', 'users', 'unhealthy-with-collateral.json'), JSON.stringify(usersWithCollateral, null, 4))

    /*
    UNI Result {
        '0': '0',
        '1': '0',
        '2': '40094918435416103126',
        '3': '0',
        '4': '39634169160970859749',
        '5': '0',
        '6': '25818249344306375969658',
        '7': '0',
        '8': false,
        currentATokenBalance: '0',
        currentStableDebt: '0',
        currentVariableDebt: '40094918435416103126',
        principalStableDebt: '0',
        scaledVariableDebt: '39634169160970859749',
        stableBorrowRate: '0',
        liquidityRate: '25818249344306375969658',
        stableRateLastUpdated: '0',
        usageAsCollateralEnabled: false
    }
    */


}

main()