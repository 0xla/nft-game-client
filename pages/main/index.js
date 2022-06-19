import React, { useEffect, useState } from 'react';
import SelectCharacter from '../../Components/SelectCharacter';
import Arena from '../../Components/Arena';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';

import myEpicGame from '../../utils/MyEpicGame.json';
import { ethers } from 'ethers';
import { useRouter } from 'next/router'

import LoadingIndicator from '../../Components/LoadingIndicator';

const Main = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()



  // Actions
 
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);

  };

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

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
       <img className='md:h-[35vw] md:w-[35vw] w-[200px] h-[200px]'
            src="https://user-generated-content_canada-is-trash.funnyjunk.com/comments/+_16cf7c7bc73adfa7a19e417bc85772f5.jpg"
            alt="Marvel vs DBZ Meme"
          />
          <div>
            <button className="btn btn-primary m-5" onClick={connectWalletAction}>Connect Wallet To Get Started</button>
          </div>
        </>
    );
    /*
     * Scenario #2
     */
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} currentAccount={currentAccount} />;
  }
};

  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const checkNetwork = () => {
      try { 
          while(window.ethereum.networkVersion !== "4"){
                alert("Please connect to Rinkeby!");
          }
      } catch(error) {
        console.log(error)
      }
    }

    if(currentAccount){
      checkNetwork();
    }
  }, [currentAccount]);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
        
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
      console.log('Current Account: ', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  return (
        <div className="bg-black min-h-screen">
            <div className="flex flex-col items-center justify-center">
            <h1 className="text-5xl font-bold mt-0 mb-6 text-white">Marvel vs Dragon Ball</h1>
                <h1 className="text-5xl font-bold mt-0 mb-6 text-white">⚔️ Battle for the Strongest ⚔️</h1>
                <h1 className="text-3xl font-bold mb-8 text-white">Team up to protect the Marvel Universe!</h1>
                <div className="flex flex-col items-center justify-center">
                {/* This is where our button and image code used to be!
                *	Remember we moved it into the render method.
                */}
                {renderContent()}
                </div>
            </div>
        </div>
  );
};

export default Main;


