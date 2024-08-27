import "../../styles/globals.css";
import StoreProvider from "../store/StoreProvider";
import { Lato } from 'next/font/google';


const lato = Lato({ weight: '400', subsets: ['latin'] })

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
