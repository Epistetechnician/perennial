import { createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error('Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_ALCHEMY_API_KEY');
}

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`),
  },
}); 