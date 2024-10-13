import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { HausThemeProvider } from "@daohaus/ui";

import { WagmiProvider, createConfig, http } from "wagmi";
import { base } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { App } from "./App";

import "./App.css";

// import { Buffer } from "buffer";
// // This solves an issue when using WalletConnect and intercept Txs to create dao proposals
// // Related open issue: https://github.com/WalletConnect/walletconnect-monorepo/issues/748
// window.Buffer = window.Buffer || Buffer;

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [base],
    transports: {
      // RPC URL for each chain
      [base.id]: http(
        `https://base-mainnet.g.alchemy.com/v2/${
          import.meta.env.VITE_BASE_ALCHEMY_KEY
        }`
      ),
    },

    // Required API Keys
    walletConnectProjectId: import.meta.env.VITE_WALLET_CONNECT_ID,

    // Required App Info
    appName: "dh test",
  })
);

export const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ConnectKitProvider>
            <HausThemeProvider>
              <App />
            </HausThemeProvider>
          </ConnectKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </HashRouter>
  </React.StrictMode>
);
