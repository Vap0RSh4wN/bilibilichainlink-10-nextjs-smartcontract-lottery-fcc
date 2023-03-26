import { ConnectButton } from "web3uikit"

export default function Header() {
    return (
        <div>
            Decentralized Lottery
            <ConnectButton moralisAuth={false} />
            {/* ConnectButton的作用和ManualHeader文件的作用完全一样；moralisAuth={false}意思是不连接到server */}
            {/* 并且把所有实现的，以及所有的改变都传给了MoralisProvider */}
        </div>
    )
}
