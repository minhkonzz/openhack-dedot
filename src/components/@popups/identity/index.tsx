import { useState, useEffect } from "react";
import { DedotClient, WsProvider } from "dedot";
import { Stack, Box, Input, Text, Button, Heading, useToast } from "@chakra-ui/react";
import { WESTEND_PEOPLE } from "../../../networks";
import { WestendPeopleApi } from "@dedot/chaintypes";
import { Injected, InjectedAccount } from "@polkadot/extension-inject/types";
import { PeopleWestendRuntimePeopleIdentityInfo } from "@dedot/chaintypes/westendPeople";

interface Props {
   account: InjectedAccount;
   injected: Injected;
   onModalClose: () => void;
};

export default function IdentityModal({ 
   account, 
   injected,
   onModalClose 
}: Props) {

   const toast = useToast();
   const [client, setClient] = useState<DedotClient<WestendPeopleApi>>();
   const [confirming, setConfirming] = useState<boolean>(false);
   const [isAlreadySetIdentity, setIsAlreadySetIdentity] = useState<boolean>(false);
   const [display, setDisplay] = useState<string>("");
   const [email, setEmail] = useState<string>("");
   const [discord, setDiscord] = useState<string>("");

   useEffect(() => {
      (async() => {
         const client = await (new DedotClient<WestendPeopleApi>(new WsProvider(WESTEND_PEOPLE.endpoint))).connect();
         setClient(client);
      })();

      return () => {
         (async() => { await client?.disconnect() })();
      }
   }, []);

   useEffect(() => {
      if (client) {
         (async() => {
            const indentity = await client.query.identity.identityOf(account.address);
            if (!indentity) return;
            const { display, email, discord } = indentity[0].info;
            if (display.type !== "None" || email.type !== "None" || discord.type !== "None") setIsAlreadySetIdentity(true);
            setDisplay(display.type === "None" ? "" : display.value);
            setEmail(email.type === "None" ? "" : email.value);
            setDiscord(discord.type === "None" ? "" : discord.value);
         })();
      }
   }, [client, account]);

   const notSetIdentity: boolean = !display && !email && !discord;

   const setIdentity = async () => {

      if (notSetIdentity) {
         toast({
            position: "top",
            title: "Please provide at least one identity field",
            status: "error",
            duration: 7000,
            isClosable: true
         });
         return;
      }

      setConfirming(true);

      const info: PeopleWestendRuntimePeopleIdentityInfo = {
         display: { type: "Raw", value: display },
         email:   { type: "Raw", value: email },
         discord: { type: "Raw", value: discord },
         image:   { type: "None" },
         legal:   { type: "None" },
         web:     { type: "None" },
         matrix:  { type: "None" },
         twitter: { type: "None" },
         github:  { type: "None" }
      }

      // not see docs for this
      const trans = await client!.tx.identity
         .setIdentity(info)
         .sign(account.address, { signer: injected.signer })

      console.log(trans);
      setConfirming(false);
      
      onModalClose();
   }

   return (
      <Stack spacing={10}>
      {
         !isAlreadySetIdentity && <>
            <Input 
               type="text"
               variant="flushed"
               focusBorderColor="#d0d4ca"
               placeholder="Display name" 
               value={display}
               onChange={e => setDisplay(e.target.value)} 
            />
            <Input 
               type="text"
               variant="flushed"
               focusBorderColor="#d0d4ca"
               placeholder="Email" 
               value={email}
               onChange={e => setEmail(e.target.value)} 
            />
            <Input 
               type="text"
               variant="flushed"
               focusBorderColor="#d0d4ca"
               placeholder="Discord" 
               value={discord}
               onChange={e => setDiscord(e.target.value)} 
            />
            <Button 
               colorScheme="gray" 
               minW="100%" 
               minH={30} 
               isLoading={confirming}
               loadingText="Waiting for confirmation..." 
               isDisabled={confirming}
               spinnerPlacement="end"
               onClick={setIdentity}>
               Set identity
            </Button>
         </> || <>
            <Box>
               <Heading as="h5">Display name</Heading>
               <Text mt={4}>{display}</Text>
            </Box>
            <Box>
               <Heading as="h5">Email</Heading>
               <Text mt={4}>{email}</Text>
            </Box>
            <Box>
               <Heading as="h5">Discord</Heading>
               <Text mt={4}>{discord}</Text>
            </Box>
         </>
      }
      </Stack>
   );
}