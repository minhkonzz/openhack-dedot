import { extendTheme } from '@chakra-ui/react'
import "@fontsource/plus-jakarta-sans";

const theme = extendTheme({
   fonts: {
      heading: `'Plus Jakarta Sans', sans-serif`,
      body: `'Plus Jakarta Sans', sans-serif`,
   },
});

export default theme;