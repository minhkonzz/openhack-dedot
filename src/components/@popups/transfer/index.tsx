import { useState } from "react";
import { DedotClient } from "dedot";
import { Injected, InjectedAccount } from "@polkadot/extension-inject/types";
import { WestendApi } from "@dedot/chaintypes";
import { TxStatus } from "dedot/types";
import { validateAddress } from "../../../utils";
import { WESTEND } from "../../../networks";

import {
   Stack,
   Input,
   Button,
   useToast
} from "@chakra-ui/react";

interface Props {
   client: DedotClient<WestendApi>;
   account: InjectedAccount;
   injected: Injected;
   onModalClose: () => void;
};

export default function TransferModal({
   client,
   account,
   injected,
   onModalClose
}: Props) {

   const toast = useToast();

   const [destAddress, setDestAddress] = useState<string>("");
   const [transferAmount, setTransferAmount] = useState<string>("");
   const [transfering, setTransfering] = useState<boolean>(false);
   const [txStatus, setTxStatus] = useState<TxStatus>();
   const [transactionError, setTransactionError] = useState<string>("");

   const transfer = async () => {
      if (!destAddress || !validateAddress(destAddress)) {
         toast({
            position: "top",
            title: "Wrong destination address",
            status: "error",
            duration: 7000,
            isClosable: true
         });
         return;
      }

      setTransfering(true);
      if (transactionError) setTransactionError("");
      if (txStatus) setTxStatus(undefined);

      const amountToTransfer = BigInt(parseFloat(transferAmount) * Math.pow(10, WESTEND.decimals));
      await client.tx.balances
         .transferKeepAlive(destAddress, amountToTransfer)
         .signAndSend(account.address, { signer: injected.signer }, (result) => {
            setTxStatus(result.status);
            const statusType: string = result.status.type;
            if (statusType === "BestChainBlockIncluded" || statusType === "Finalized") {
               if (result.dispatchError) {
                  toast({
                     position: "top",
                     title: "Transfer failed",
                     status: "error",
                     colorScheme: "#ff7777",
                     duration: 7000,
                     isClosable: true
                  })
                  setTransactionError(`${JSON.stringify(Object.values(result.dispatchError))}`);
                  return;
               }
               if (statusType === "Finalized") {
                  toast({
                     position: "top",
                     title: "Transfer success",
                     status: "success",
                     colorScheme: "#88d66c",
                     duration: 7000,
                     isClosable: true
                  })
                  onModalClose();
               }
            }
         });
   }

   return (
      <Stack spacing={10}>
         <Input 
            type="text"
            variant='flushed' 
            placeholder='Destination address' 
            focusBorderColor="#d0d4ca"
            value={destAddress}
            onChange={(e) => setDestAddress(e.target.value)} 
         />
         <Input 
            type="number"
            variant='flushed' 
            placeholder='Amount to transfer' 
            focusBorderColor="#d0d4ca"
            value={transferAmount}
            onChange={e => setTransferAmount(e.target.value)} 
         />
         <Button 
            colorScheme="gray" 
            minW="100%" 
            minH={30} 
            isLoading={transfering}
            loadingText={txStatus?.type || "Transfering..."} 
            isDisabled={!destAddress ||!transferAmount || parseFloat(transferAmount) <= 0 || transfering}
            spinnerPlacement="end"
            onClick={transfer}>
            Transfer
         </Button>
      </Stack>
   );
}