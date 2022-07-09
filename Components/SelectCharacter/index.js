/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

import LoadingIndicator from '../LoadingIndicator';
import useSound from 'use-sound';
import thunderSound from '../../sounds/thunderSoundEffect.mp3';

const SelectCharacter = ({setCharacterNFT}) => {
    const [character, setCharacter] = useState(null);
    const [charIndex, setCharIndex]  = useState(-1);
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);
    const [mintingCharacter, setMintingCharacter] = useState(false);
    const [playSound] = useSound(thunderSound, {
        volume: 0.01
    })
    //  border-[0.5px] border-solid border-white
    const displayCharacter = (character) => {
        console.log("inside displayCharacter");
        return ( 
            <div className='flex flex-col btn-ghost'>
                <div className="text-white text-xl font-bold text-center p-1">
                    {character.name}
                </div>
                <img 
                    className='hover:cursor-pointer drop-shadow-lg'
                    src={`https://nftstorage.link/ipfs/${character.imageURI}`}  
                    alt={character.name} />
                <button
                    data-theme="dark"
                    className="btn btn-active btn-ghost"
                    onClick={()=> {
                        mintCharacterNFTAction(charIndex);
                        playSound();
                    }}
                    >
                    {`Mint ${character.name}`}
                </button>
            </div>
        )
    }

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
//       <div className="text-white text-xl font-bold text-center p-1 border-[0.5px] border-solid border-white">
//       {character.name}
//   </div>
{/* <button
className="btn btn-active btn-ghost"
onClick={()=> mintCharacterNFTAction(index)}
>
{`Mint ${character.name}`}
</button> */}
    const renderCharacters = () =>
        characters.map((character, index) => (
            <div key={character.name} className="flex flex-col gap-5">
                <button onClick={() => 
                {
                    setCharacter(character);
                    setCharIndex(index);
                }}>
                    <img 
                        className='hover:cursor-pointer drop-shadow-lg'
                        src={`https://nftstorage.link/ipfs/${character.imageURI}`}  
                        alt={character.name} />
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
        <div className="min-h-screen bg-cover bg-[url('https://wallpaperaccess.com/full/772411.jpg')]">
            <div className="flex flex-row">
            <div className='flex flex-col w-[70vw] items-center'>
                <h1 className='text-3xl p-2 text-white'>
                    Mint your hero. Choose wisely. 
                </h1>
                {characters.length > 0 && (
                    <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3 p-2'
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
                <div className='flex w-[40vw] p-2 justify-center'>
                    {character && displayCharacter(character)}
                </div>
        </div>
        </div>
    )
}

export default SelectCharacter;