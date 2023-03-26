import { useMoralis } from "react-moralis"
import { useEffect } from "react"


export default function ManualHeader(){//export default 让别的js也能用本文件中的函数

    const {enableWeb3,isWeb3Enabled,account,Moralis,deactivateWeb3,isWeb3EnableLoading} = useMoralis()//react hook,能追踪state，并且重渲染rerender界面
    // enableWeb3()适用于metamask
    // enableWeb3()等同于await ethereum.request({ method: "eth_requestAccounts" })
    // isWeb3Enabled是一个hook变量，能够追踪是否已经连接了metamask
    // account也是一个hook变量，追踪已经连接的account，所以此时如果切换账户会发现地址也变了
    // deactivateWeb3()会设置isWeb3Enabled为false
    // isWeb3EnableLoading检查是否metamask的连接页面已经弹出（正在连接？）

    useEffect(()=>{
        if(isWeb3Enabled) return
        if(typeof window!== "undefined"){
            if(window.localStorage.getItem("connected")){
                enableWeb3()
            }
        } 
    },[isWeb3Enabled])
    // 参数：第一个参数是输入一个函数，第二个参数（optional）是dependency array
    // 作用：持续追踪dependency array中的值，如果值有任何变化就call第一个参数function，并且重渲染rerender界面，useEffect会又执行一或两次（取决于是否是严格模式），导致在未知意愿的情况下执行了多次
    //！注意：【】中传入的参数必须要变化，才会触发rerender重渲染，否则可能会导致值不显示，不加载等问题。
    // 如果第二个参数不输入，会导致当任何其他函数触发导致页面rerender重渲染时，useffect会再
    // 严格模式下这东西会运行两次。react18将useEffect的默认运行改为了两次。这个更改只有在开发模式才会发生，且只在只在 strict mode 发生，恰恰如此无疑令很多开发者感觉很蛋疼
    // it runs twice here because of react.strictMode模式. see GitHub repo for more information

    useEffect(()=>{
        Moralis.onAccountChanged((account)=>{
            console.log(`Account changed to ${account}`)
            if(account==null){
                window.localStorage.removeItem("connected")
                deactivateWeb3()    // deactivateWeb3()会设置isWeb3Enabled为false
                console.log("Null account found!")
            }
        } )
    },[])

    return(<div>
        {account
        ?(<div>Connected to {account.slice(0,6)}...{account.slice(account.length-4)}</div>)
        :(<button onClick={async ()=>{
            await enableWeb3()
    // enableWeb3()相当于https://github.com/PatrickAlphaC/html-fund-me-fcc/blob/main/index.js的13-26行
    if(typeof window!== "undefined"){
        window.localStorage.setItem("connected","Injected")

    }

            }} disabled={isWeb3EnableLoading}>connect</button>)}
        {/* setItem是在浏览器F12那里的Application里设置一个新的键值对。 */}
    </div>)
}