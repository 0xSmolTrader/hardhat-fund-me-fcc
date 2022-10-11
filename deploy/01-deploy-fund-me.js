const { network } = require("hardhat")

const {networkConfig, developmentChains} = require("../helper-hardhat-config")

const { verify } = require("../utils/verify")
const chainId = network.config.chainId

//const helperConfig = require("../helper-hardhat-config")
//const networkConfig = helperConfig.networkConfig




module.exports = async({getNamedAccounts, deployments}) => {
 
      const {deploy,log} = deployments
      const {deployer} = await getNamedAccounts()
      

     // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

      let ethUsdPriceFeedAddress 

      if(developmentChains.includes(network.name)){

            const ethUsdAggregator = await deployments.get("MockV3Aggregator")
            ethUsdPriceFeedAddress = ethUsdAggregator.address
      }else{

            ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
      }

      
      const args = [ethUsdPriceFeedAddress]
      const fundme = await deploy("FundMe",{
        contract:"FundMe",
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
        
      })

      if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
 
          await verify(fundme.address,args)

         }

      log("-----------------------------------------------")
        
  
}    

module.exports.tags = ["all","fundme"]
