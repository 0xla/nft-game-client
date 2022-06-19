import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

import LoadingIndicator from '../LoadingIndicator';

const SelectCharacter = ({setCharacterNFT}) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);
    

    const mintCharacterNFTAction = async (characterId) => {
        try {
          if (gameContract) {
            setMintingCharacter(true);
            console.log('Minting character in progress...');
            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log('mintTxn:', mintTxn);
            setMintingCharacter(false);

          }
        } catch (error) {
          console.warn('MintCharacterAction Error:', error);
          setMintingCharacter(false);
        }
      };      
      // `https://nftstorage.link/ipfs/${character.imageURI}`
    const renderCharacters = () =>
    characters.map((character, index) => (
        <div key={character.name} className="flex flex-col gap-5">
            <div className="text-white text-xl font-bold text-center p-1 border-[0.5px] border-solid border-white">
                {character.name}
            </div>
            <img 
                src={character.imageURI} 
                className="w-[30vw]" 
                alt={character.name} />
            <button
                className="btn btn-active btn-ghost"
                onClick={()=> mintCharacterNFTAction(index)}
            >
                {`Mint ${character.name}`}
            </button>
        </div>
    ));


    useEffect( () => {
        const {ethereum} = window;
        if( ethereum ){
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS, 
                myEpicGame.abi,
                signer
            )
            setGameContract(gameContract);
        }
        else {
            console.log('Ethereum object not found');
          }
        },[]);

    useEffect( () => {
        const getCharacters = async () => {
            try {
                console.log('Getting contract characters to mint');
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("Characters Txn : ", charactersTxn);
                const characters = charactersTxn.map((characterData) => {
                    return transformCharacterData(characterData);
                })
                setCharacters(characters);
            }
            catch(err){
                console.log(err);
            }
        }

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()} `);
            
            if (gameContract){
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log('CharacterNFT: ', characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
                alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
            }
        
        }
        if (gameContract){
            getCharacters();
            gameContract.on('CharacterNFTMinted', onCharacterMint);
        }
        return () => {
            if (gameContract) {
                gameContract.off('CharacterNFTMinted', onCharacterMint);
            }
        };
        
    }, [gameContract]);

    return (
        <div className='text-white flex flex-col justify-center items-center'>
            <h1 className='text-3xl'>
                Mint your hero. Choose wisely. 
            </h1>
            {characters.length > 0 && (
                <div className='flex flex-row gap-10 mt-[10px]'
                >
                    {renderCharacters()}
                </div>
            )}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                    <LoadingIndicator />
                    <p>Minting In Progress...</p>
                    </div>
                        <img
                        src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
                        alt="Minting loading indicator"
                    />
                </div>
                )}
        </div>
    )
}

export default SelectCharacter;