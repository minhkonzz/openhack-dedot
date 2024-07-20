import { memo, useState, Dispatch, SetStateAction } from "react";
import { Button } from "@chakra-ui/react";
import { Injected, InjectedAccount, InjectedWindow, InjectedWindowProvider } from '@polkadot/extension-inject/types';

interface Props {
   setAccount: Dispatch<SetStateAction<InjectedAccount | undefined>>;
   setInjected: Dispatch<SetStateAction<Injected | undefined>>;
};

function ConnectWalletButton({ setAccount, setInjected }: Props) {

   const [connecting, setConnecting] = useState(false);

   const onClick = async () => {
      setConnecting(true);
      const injectedWindow = window as Window & InjectedWindow;
      const provider: InjectedWindowProvider = injectedWindow.injectedWeb3['subwallet-js'];
      const injected: Injected = await provider.enable!("OpenHack Dedot");
      const accounts: InjectedAccount[] = await injected.accounts.get();
      setAccount(accounts[0]);
      setInjected(injected);
      setConnecting(false);
   }

   return (
      <Button {...{
         onClick,
         colorScheme: "gray",
         isLoading: connecting,
         spinnerPlacement: "end",
         loadingText: "Connecting Wallet"
      }}>
         Connect Wallet
      </Button>
   )
};

export default memo(ConnectWalletButton);