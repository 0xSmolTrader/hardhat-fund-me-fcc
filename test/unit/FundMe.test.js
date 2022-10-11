const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert,expect } = require("chai")
const { ethers,deployments,getNamedAccounts } = require("hardhat")
const {developmentChains} = require("../../helper-hardhat-config")

!developmentChains.includes(network.name) ? describe.skip
:describe("FundMe",async function(){

    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async function(){

      //const accounts = await ethers.getSigners()
     //const accountZero = accounts[0]

      deployer = (await getNamedAccounts()).deployer

      await deployments.fixture(["all"])


      fundMe = await ethers.getContract("FundMe",deployer)

      mockV3Aggregator = await ethers.getContract("MockV3Aggregator",deployer)

    })

  describe("constructor",async function(){

       it("sets the aggregator addresses correctly",async function(){

            const response = await fundMe.getPriceFeed()
            assert.equal(response,mockV3Aggregator.address)

       })

  })

  describe("fund",async function(){
  
      it("fails if you dont send enough eth",async function(){

        await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
        )
      })




  })

it("updates the amount funded data structure", async function(){

await fundMe.fund({value:sendValue})
const response = await fundMe.getAddressToAmountFunded(deployer)
assert.equal(response.toString(),sendValue.toString())


})

it("adds funder to array of getFunders", async function(){

  await fundMe.fund({value:sendValue})

  const funder = await fundMe.getFunders(0)

  assert.equal(funder,deployer)

})


describe ("withdraw",async function(){

beforeEach(async function(){

  
    await fundMe.fund({value:sendValue})


  })

  it("withdraw ETH from a single founder",async function(){

      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
      
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

      const transctionResponse = await fundMe.withdraw()

      const transactionReciept = await transctionResponse.wait(1)
  
      const {gasUsed,effectiveGasPrice} = transactionReciept

       const gasCost = gasUsed.mul(effectiveGasPrice)

       const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

       const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

      assert(endingFundMeBalance,0)
      assert(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())


  })




  it("allow us to withdraw with multiple getFunders",async function(){

      const accounts = await ethers.getSigners()

      for(let i = 1; i < 6;i++){

        const fundMeConnectContract = await fundMe.connect(accounts[i])

        await fundMeConnectContract.fund({value:sendValue})


      }

      const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
      
      const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

     const transctionResponse = await fundMe.withdraw()

     const transactionReciept = await transctionResponse.wait(1)
  
     const {gasUsed,effectiveGasPrice} = transactionReciept

     const gasCost = gasUsed.mul(effectiveGasPrice)



     
     const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

     const endingDeployerBalance = await fundMe.provider.getBalance(deployer)


     assert(endingFundMeBalance,0)
     assert(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

    await expect(fundMe.getFunders(0)).to.be.reverted

      
    for(i = 1; i < 6;i++){
      
      const amountfunded = await fundMe.getAddressToAmountFunded(accounts[i].address)

      assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)

       }
   

    })

   it("only allows the owner to withdraw", async function(){

    const accounts = await ethers.getSigners()

    const attacker = accounts[1]

    const attackerConnectContract = await fundMe.connect(attacker)

    await expect(attackerConnectContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")


   })
  

   it("cheaper withdraw with multiple getFunders",async function(){

    const accounts = await ethers.getSigners()

    for(let i = 1; i < 6;i++){

      const fundMeConnectContract = await fundMe.connect(accounts[i])

      await fundMeConnectContract.fund({value:sendValue})


    }

    const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
    
    const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

   const transctionResponse = await fundMe.cheaperWithdraw()

   const transactionReciept = await transctionResponse.wait(1)

   const {gasUsed,effectiveGasPrice} = transactionReciept

   const gasCost = gasUsed.mul(effectiveGasPrice)



   
   const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

   const endingDeployerBalance = await fundMe.provider.getBalance(deployer)


   assert(endingFundMeBalance,0)
   assert(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())

  await expect(fundMe.getFunders(0)).to.be.reverted

    
  for(i = 1; i < 6;i++){
    
    const amountfunded = await fundMe.getAddressToAmountFunded(accounts[i].address)

    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address),0)

     }
 

  })


  it("cheaper withdraw ETH from a single founder",async function(){

    const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
    
    const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

    const transctionResponse = await fundMe.cheaperWithdraw()

    const transactionReciept = await transctionResponse.wait(1)

    const {gasUsed,effectiveGasPrice} = transactionReciept

     const gasCost = gasUsed.mul(effectiveGasPrice)

     const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)

     const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

    assert(endingFundMeBalance,0)
    assert(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())


})





  
  })




 })