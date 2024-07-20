import { useState, useEffect } from "react";
import { DedotClient, WsProvider } from "dedot";
import { Injected, InjectedAccount } from '@polkadot/extension-inject/types';
import { WestendApi } from "@dedot/chaintypes";
import { WESTEND } from "./networks";
import { Flex, Spinner } from "@chakra-ui/react"
import ConnectWalletButton from "./components/connect-wallet-button";
import EventHeading from "./components/event-heading";
import MainInterface from "./components/main-interface";

export default function Result() {

   const [client, setClient] = useState<DedotClient<WestendApi>>();
   const [injected, setInjected] = useState<Injected>();
   const [account, setAccount] = useState<InjectedAccount>();
   
   useEffect(() => {
      (async() => {
         const client = await (new DedotClient<WestendApi>(new WsProvider(WESTEND.endpoint))).connect();
         setClient(client);
      })();

      return () => {
         (async() => { await client?.disconnect() })();
      }
   }, []);

   const isClientConnected = client && client.status === "connected"
   const isConnectedAccount = isClientConnected && injected && !!account?.address;

   return (
      <Flex minW="100vw" minH="100vh" justifyContent="center" alignItems="center"> {
         isClientConnected && 
         <>
            <EventHeading />
            { isConnectedAccount && <MainInterface {...{client, account, injected}} /> || <ConnectWalletButton {...{setAccount, setInjected}} /> }
         </> || 
         <Spinner color="gray" size="xl" />
      }   
      </Flex>
   );
}