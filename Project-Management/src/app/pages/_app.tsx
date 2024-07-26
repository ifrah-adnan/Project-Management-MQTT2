import { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";
import "leaflet/dist/leaflet.css";

import { ThemeProvider } from "next-themes";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default appWithTranslation(MyApp);
