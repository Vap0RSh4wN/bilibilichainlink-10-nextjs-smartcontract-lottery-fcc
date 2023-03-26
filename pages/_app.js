import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import { NotificationProvider } from "web3uikit"

export default function App({ Component, pageProps }) {
    return (
        // Moralis在_app.js中，需要用一个ContextProvider来包装整个应用程序：

        <MoralisProvider initializeOnMount={false}>
            {/* Morlais有内置的属性选项，例如：可以用数据库设置前端，然而，如果你只想使用钩子和函数，你可以把initializeOnMount设置为false，等将来需要时才设置服务器 */}
            <NotificationProvider>
                <Component {...pageProps} />
            </NotificationProvider>
        </MoralisProvider>
        // The reason Moralis knows about what chain we're on is because back inour header component.
        // The header actually passes up all the information about the metamask to the Moralis's
        // and then the Moralis's provider passes it down to all the components inside those Moralis's provided tags.
    )
}
