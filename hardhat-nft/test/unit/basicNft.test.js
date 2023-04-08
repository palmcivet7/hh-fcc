const { ethers } = require("hardhat")
const { assert } = require("chai")

describe("BasicNft", function () {
    let basicNft

    beforeEach(async function () {
        const BasicNft = await ethers.getContractFactory("BasicNft")
        basicNft = await BasicNft.deploy()
        await basicNft.deployed()
    })

    it("should have the correct name and symbol", async function () {
        const name = await basicNft.name()
        const symbol = await basicNft.symbol()

        assert.equal(name, "Dogie")
        assert.equal(symbol, "DOG")
    })

    it("allows users to mint an NFT and increments token counter appropriately", async function () {
        const tokenCounterBefore = await basicNft.getTokenCounter()
        await basicNft.mintNft()
        const tokenCounterAfter = await basicNft.getTokenCounter()

        assert.equal(tokenCounterBefore.toNumber(), 0)
        assert.equal(tokenCounterAfter.toNumber(), 1)
    })

    it("should return the correct token URI", async function () {
        const tokenURI = await basicNft.tokenURI(0)

        assert.equal(
            tokenURI,
            "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json"
        )
    })
})
