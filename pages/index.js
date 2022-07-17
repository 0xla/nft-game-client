import React, { useEffect, useState } from 'react';
import SelectCharacter from '../Components/SelectCharacter';
import Arena from '../Components/Arena';
import { CONTRACT_ADDRESS, transformCharacterData } from '../constants';

import myEpicGame from '../utils/MyEpicGame.json';
import { ethers } from 'ethers';
import {useRouter} from 'next/router'

import LoadingIndicator from '../Components/LoadingIndicator';

import {AiOutlineQuestionCircle} from 'react-icons/ai';

import Link from 'next/link'

const Main = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentNetwork, setCurrentNetwork] = useState("-1");
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  // Actions
 
  
  // const checkIfWalletIsConnected = async () => {
  //   try {
  //     const { ethereum } = window;

  //     if (!ethereum) {
  //       console.log('Make sure you have MetaMask!');
  //       setIsLoading(false);
  //       return;
  //     } else {
  //       console.log('We have the ethereum object', ethereum);

  //       const accounts = await ethereum.request({ method: 'eth_accounts' });

  //       if (accounts.length !== 0) {
  //         const account = accounts[0];
  //         console.log('Found an authorized account:', account);
  //         setCurrentAccount(account);
  //       } else {
  //         console.log('No authorized account found');
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   setIsLoading(false);

  // };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      alert("Sound effects over the next pages");
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

// Render Methods
const renderContent = () => {
  /*
   * Scenario #1
   */
  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!currentAccount) {
    return (<>
          <div
          className="bg-white h-screen overflow-y-auto flex md:flex-row flex-col "
          >
            <div className='flex flex-col p-[5vw] lg:w-auto items-center md:justify-center'>
              <span className='text-black flex flex-wrap p-4 text-xl font-bold text-center'>Protect the Marvel Universe against Goku!</span>  
                <div className='flex flex-row gap-2 items-center'>
                  <button className="btn btn-wide text-white w-auto" onClick={connectWalletAction}>Connect Wallet to Play Game</button>
                  <div className="tooltip" data-tip="Don't have a wallet ? Click me to open a tutorial.">
                    <div className="text-2xl">
                      <Link href="https://medium.com/@alias_73214/guide-how-to-setup-metamask-d2ee6e212a3e#:~:text=After%20installing%2C%20click%20on%20the,for%20a%20new%20Ethereum%20account.">
                        <a target="_blank"><AiOutlineQuestionCircle /></a>
                      </Link>
                    </div>
                  </div>
                </div>
            </div>
            <img
              alt="landingPage"
              src="/goku-with-marvel.jpeg"
              className="h-auto lg:w-auto w-[100vw]"
            />
      </div>

        </>
    );
    /*
     * Scenario #2
     */
  } else if (currentAccount && currentNetwork === "4" && !characterNFT ) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && currentNetwork === "4" && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} currentAccount={currentAccount} />;
  }
};

  // useEffect(() => {
  //   setIsLoading(true);
  //   checkIfWalletIsConnected();
  // }, []);

  // useEffect(() => {
    

  //   if(currentAccount){
  //     checkNetwork();
  //   }
  // }, [currentAccount]);

  // useEffect(() => {
  //   const checkNetwork = () => {
  //     try { 
  //       console.log("checking, netword Id ", currentNetwork)
  //         while(window.ethereum.networkVersion !== "4"){
  //               alert("Please connect to Rinkeby!");
  //               setCurrentNetwork(window.ethereum.networkVersion);
  //         }
  //         setCurrentNetwork(4);
  //     } catch(error) {
  //       console.log(error)
  //     }
  //   }
  // }, [currentNetwork]);

  useEffect(() => {
    const checkNetwork = () => {
      try {
        if(window.ethereum.networkVersion !== "4"){
            alert("Please connect to Rinkeby!");
            router.reload(window.location.pathname);
        }
      } catch(error) {
        console.log(error)
      }
    }

    const fetchNFTMetadata = async () => {
      // 
      console.log("Checking for character nft on address", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS, 
        myEpicGame.abi, 
        signer
      )

      const txn = await gameContract.checkIfUserHasNFT();
      if(txn.name){
        console.log('User has character NFT')
        setCharacterNFT(transformCharacterData(txn));
      } else{
        console.log('No charater found')
      }
      setIsLoading(false);
    }

    if (currentAccount){
      setCurrentNetwork(window.ethereum.networkVersion);
      checkNetwork();
      // if(currentNetwork === "4"){
          fetchNFTMetadata();
      
    }
}, [currentAccount, router]);

  return (
        <div className="min-h-screen">
                {renderContent()}
        </div>
  );
};

export default Main;


