import Image from "next/image"
import { Inter } from "next/font/google"
import { Form, useNotification } from "web3uikit"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import nftAbi from "../constants/BasicNft.json"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import networkMapping from "../constants/networkMapping.json"

const inter = Inter({ subsets: ["latin"] })

export default function Home() {
    const { chainId } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
    const dispatch = useNotification()

    const { runContractFunction } = useWeb3Contract()

    async function approveAndList(data) {
        console.log("Approving...")
        const nftAddress = data.data[0].inputResult
        const tokenId = data.data[1].inputResult
        const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

        const approveOptions = {
            abi: nftAbi,
            contractAddress: nftAddress,
            functionName: "approve",
            params: {
                to: marketplaceAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: approveOptions,
            onSuccess: () => handleApproveSuccess(nftAddress, tokenId, price),
            onError: (error) => {
                console.log(error)
            },
        })
    }

    async function handleApproveSuccess(nftAddress, tokenId, price) {
        console.log("Ok! Now time to list!")
        const listOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "listItem",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
            },
        }

        await runContractFunction({
            params: listOptions,
            onSuccess: () => handleListSuccess(),
            onError: (error) => console.log(error),
        })
    }

    async function handleListSuccess() {
        dispatch({
            type: "success",
            message: "NFT listing",
            title: "NFT Listed",
            position: "topR",
        })
    }

    // const handleWithdrawSuccess = () => {
    //     dispatch({
    //         type: "success",
    //         message: "Withdrawing proceeds",
    //         position: "topR",
    //     })
    // }

    // return (
    //     <div>
    //         <Form
    //             onSubmit={approveAndList}
    //             data={[
    //                 {
    //                     name: "NFT Address",
    //                     type: "text",
    //                     inputWidth: "50%",
    //                     value: "",
    //                     key: "nftAddress",
    //                 },
    //                 {
    //                     name: "Token ID",
    //                     type: "number",
    //                     value: "",
    //                     key: "tokenId",
    //                 },
    //                 {
    //                     name: "Price (in ETH)",
    //                     type: "number",
    //                     value: "",
    //                     key: "price",
    //                 },
    //             ]}
    //             title="Sell your NFT!"
    //             id="Main Form"
    //         />
    //         <div>Withdraw {proceeds} proceeds</div>
    //         {proceeds != "0" ? (
    //             <Button
    //                 onClick={() => {
    //                     runContractFunction({
    //                         params: {
    //                             abi: nftMarketplaceAbi,
    //                             contractAddress: marketplaceAddress,
    //                             functionName: "withdrawProceeds",
    //                             params: {},
    //                         },
    //                         onError: (error) => console.log(error),
    //                         onSuccess: () => handleWithdrawSuccess,
    //                     })
    //                 }}
    //                 text="Withdraw"
    //                 type="button"
    //             />
    //         ) : (
    //             <div>No proceeds detected</div>
    //         )}
    //     </div>
    // )
}
