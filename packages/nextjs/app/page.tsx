"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import PerennialPredictor from './perrenialpredictor';

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5"></div>
        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <PerennialPredictor />
        </div>
      </div>
    </>
  );
};

export default Home;
