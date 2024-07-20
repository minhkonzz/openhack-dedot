import { useState, useEffect, useCallback, memo } from "react";
import { DedotClient } from "dedot";
import { FrameSystemAccountInfo } from '@dedot/chaintypes/polkadot';
import { Injected, InjectedAccount } from '@polkadot/extension-inject/types';
import { formatBalance } from "../../utils";
import { WestendApi } from "@dedot/chaintypes";
import { WESTEND } from "../../networks";
import { TransferModal, IdentityModal } from "../@popups";

import { 
   Stack,
   Text, 
   Button, 
   FormControl, 
   Modal, 
   ModalOverlay, 
   ModalContent, 
   ModalBody, 
   useDisclosure
} from "@chakra-ui/react";

const modals = {
   transfer: TransferModal,
   identity: IdentityModal
} as const;

type ModalType = keyof typeof modals;

interface Props {
   client: DedotClient<WestendApi>;
   account: InjectedAccount;
   injected: Injected;
};

export default function MainInterface({ client, account, injected }: Props) {

   const { 
      isOpen: isModalOpen, 
      onOpen: onModalOpen, 
      onClose: onModalClose 
   } = useDisclosure();

   const [balance, setBalance] = useState<FrameSystemAccountInfo>();
   const [modal, setModal] = useState<{ type: ModalType, props: any }>();

   useEffect(() => {
      let unsubBalance: any;
      (async() => {
         // subscribe to balance changing
         unsubBalance = await client.query.system.account(
            account.address, 
            (balance: FrameSystemAccountInfo) => setBalance(balance)
         );
      })();

      return () => {
         unsubBalance && unsubBalance();
      }
   }, [account, client]);

   const AccountInfo = useCallback(memo(() => {
      
      const openModal = (modalType: ModalType, props: any) => {
         setModal({ type: modalType, props });
         onModalOpen();
      }

      return (
         <Stack spacing={4} minW={650} alignItems="center" mb={100}>
            <Text fontSize="lg" fontWeight={800}>{account.name}</Text>
            <Text fontSize="md">{account.address}</Text>
            <Text fontSize="6xl" mt={30}>{balance?.data && formatBalance(balance.data.free, WESTEND.decimals)}</Text>
            <Button 
               mt={50}
               minW={500}
               minH={50} 
               maxW="100%" 
               onClick={() => openModal("transfer", {client, account, injected, onModalClose})}>
               Make transfer
            </Button>
            <Button 
               minW={500}
               minH={50} 
               maxW="100%" 
               onClick={() => openModal("identity", {account, onModalClose})}>
               On-chain identity
            </Button>
         </Stack>
      );
   }), [account, client, balance]);

   const ModalBodyContent = modals[modal!?.type];

   return (
      balance?.data &&  
      <>
         <AccountInfo />
         <Modal {...{
            isOpen: isModalOpen, 
            onClose: onModalClose,
            isCentered: true,
            motionPreset: "slideInBottom"
         }}>
            <ModalOverlay backdropFilter="blur(4px)" />
            <ModalContent>
               <ModalBody px={8} py={10}>
                  <FormControl>
                     { ModalBodyContent && <ModalBodyContent {...(modal!.props)} /> }
                  </FormControl>
               </ModalBody>
            </ModalContent>
         </Modal> 
      </> || <></>
   );
};