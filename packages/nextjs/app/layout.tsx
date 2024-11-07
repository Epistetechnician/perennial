import { Metadata } from "next";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";

export const metadata: Metadata = {
  title: "Perennial Predictor",
  description: "Built with 🏗 Scaffold-ETH 2",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>
        <ScaffoldEthAppWithProviders>
          {children}
        </ScaffoldEthAppWithProviders>
      </body>
    </html>
  );
};

export default RootLayout;
