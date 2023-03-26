//have a function to enter the lottery
import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constants/index"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit" //https://web3ui.github.io/web3uikit/?path=/docs/5-popup-notification--hook-demo

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis() //获得十六进制chainId的别名(rename)chainIdHex
    // The reason Moralis knows about what chain we're on
    // is because back in our header component,
    // the header actually passes up all the information about the metamask to the moralis's
    // and then the moralis's provider passes down to all the components inside those moralis's provider tags.
    console.log("isWeb3Enabled", isWeb3Enabled)
    console.log(parseInt(chainIdHex))

    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    //这里的entranceFee为什么要设置成一个hook？因为使用useEffect有一个问题。
    //注意，只有[]中传入的参数必须发生变化时，才会触发rerender重渲染。
    //如果从头到尾isWeb3Enabled都是True，那页面根本不会rerender，下面return中的entranceFee也根本不会在页面中显示。
    //因此，我们要把entranceFee改成一个hook，而不是只是简单的普通变量
    const [entranceFee, setEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification() //https://web3ui.github.io/web3uikit/?path=/docs/5-popup-notification--hook-demo

    // runContractFunction can both send transactions and read state
    const {
        runContractFunction: enterRaffle,
        isFetching,
        isLoading,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //[chainId][0] specify the networkId
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee, // One of the ways that this is one of the wayst we can resend send a transaction and we can also send functions
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, //[chainId][0] specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getPlayersNumber } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeecall = (await getEntranceFee()).toString()
        setEntranceFee(entranceFeecall)
        const numberOfPlayerscall = (await getPlayersNumber()).toString()
        setNumberOfPlayers(numberOfPlayerscall)
        const recentWinnercall = await getRecentWinner()
        setRecentWinner(recentWinnercall)
        console.log("更新了")
    }

    //想建立一个hook，在调用本文件时就先去监控获取getEntranceFee里的entrancefee，然后给msg.value
    //We're only going to want to try to get that raffle entrance fee if Web3 is enabled
    //但这里使用useEffect有一个问题。
    //注意，只有[]中传入的参数必须发生变化时，才会触发rerender重渲染。
    //如果从头到尾isWeb3Enabled都是True，那页面根本不会rerender，下面return中的entranceFee也根本不会在页面中显示。
    //因此，我们要把entranceFee改成一个useState hook，让他自己rerender，而不是只是简单的普通变量
    useEffect(() => {
        if (isWeb3Enabled) {
            // 如果调用了metamask，就尝试读取raffle entrance fee
            // 注意，所有合约的方法都是async function，要await，
            // 但如果直接写await会报错，因为在useEffect里无法使用await，
            // 我猜是因为await只能用在异步函数里，而这里并没有异步函数
            // 所以在这里我们自己构建一个异步函数，使用await

            updateUI() //我们会发现如果不在下方handleSuccess()里也写入这个函数，该函数只会在每个页面刚刷新后调用一次，并不会rerender，导致enterRaffle后界面值不会刷新。
            //我猜：因为isWeb3Enabled可能刚被定义初始化时候是const，刷新后会检查当前是否连接metamask，
            //检查到后立刻变成true，这个改变会让updateUI()执行一次，但是至此之后isWeb3Enabled不会再改变，
            //useEffect以及页面不会rerender，调用不了updateUI()使得useState也不会rerender，因为根本没法再执行。
        }
    }, [isWeb3Enabled])
    // useEffect()的第二个参数最重要：
    // no list means it'll update everytime when rerender (anything changes or happens)
    // empty list means it'll run once after the initial rendering
    // and dependencies mean it'll run whenever those things in the list change

    const handleNewNotification = () => {
        //看原文档，这个函数就是非异步函数https://web3ui.github.io/web3uikit/?path=/docs/5-popup-notification--hook-demo
        dispatch({
            type: "success",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            // updateUIValues()
            handleNewNotification(tx)
            updateUI() //上面的updateUI()只会在页面刷新后调用一次就不再调用，导致一直无法rerender，
            //这里再调用一次，可通过useState()的特性rerender页面实现值的更新。
            //但是老师说，这里更好的办法是通过设置listener来监控event有没有被emit，有空可以自己试一下。
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div>
            Lottery
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                //This “onSuccess” isn't checking that the transaction has ablock confirmation?
                                //It's just checking to see that they transaction wassuccessfully sent to Metamask
                                onError: (error) => {
                                    console.log(error)
                                },
                            }) //onSuccess:when this function is successful. onComplete/onError
                            //推荐为所有contract function都设置onError参数，这样如果run contract function break了我们会知道
                        }}
                        disabled={isFetching || isLoading}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")}ETH
                    <div>The current number of players is: {numberOfPlayers}</div>
                    <div>The most previous winner was: {recentWinner}</div>
                </div>
            ) : (
                "Enter Raffle"
            )}
        </div>
    )
}

//data return from function call, function we can used to call
