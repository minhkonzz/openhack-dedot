import dedotLogo from "../../assets/dedot-dark-logo.png";
import { memo } from "react";
import { Flex, Heading } from "@chakra-ui/react";

function EventHeading() {
   return (
      <Flex dir="row" alignItems="center" pos="absolute" top={8} left={8}>
         <a href="https://dedot.dev" target="_blank">
            <img width="70" src={dedotLogo} className='logo' alt="EventLogo" />
         </a>
         <Heading as="h4" size="lg" textAlign="center" ml={4}>Open Hack Dedot</Heading>
      </Flex>
   );
};

export default memo(EventHeading);