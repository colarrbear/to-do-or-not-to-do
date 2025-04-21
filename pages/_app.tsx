import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.css";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  useEffect(() => {
    // Import Bootstrap JS only on client side
    typeof document !== "undefined" &&
      require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
} 