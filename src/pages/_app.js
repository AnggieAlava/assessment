import "../../styles/globals.css";
import StoreProvider from "../store/StoreProvider";
import { Lato, Space_Grotesk } from 'next/font/google';


const lato = Lato({ weight: '400', subsets: ['latin'] })
const spaceGrotesk = Space_Grotesk({ weight: '700', subsets: ['latin'] });

function MyApp({ Component, pageProps }) {
  return (
    <StoreProvider>
      <div className={lato.className}>
        <Component {...pageProps} />
      </div>
    </StoreProvider>
  );
}

export default MyApp;
