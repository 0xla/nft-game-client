/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { BigNumber, ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';

import LoadingIndicator from '../LoadingIndicator';
import useSound from 'use-sound';
import thunderSound from '../../sounds/thunderSoundEffect.mp3';

import {AiOutlineQuestionCircle} from 'react-icons/ai';
import Link from 'next/link'

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
        const damageBar = (character.attackDamage * 0.5) + "%";
        const hpBar = (character.maxHp * 100/3000) + "%";
        return ( 
            <div className='flex flex-col btn-ghost gap-1 m-2'>
                <div className="text-white text-xl font-bold text-center">
                    {character.name}
                </div>
                <img 
                    className='hover:cursor-pointer drop-shadow-lg md:h-[30vw] md:w-[30vw] object-cover object-top'
                    src={`https://nftstorage.link/ipfs/${character.imageURI}`}  
                    alt={character.name} />
                <button
                    data-theme="dark"
                    className="btn btn-active text-white btn-ghost"
                    onClick={()=> {
                        mintCharacterNFTAction(charIndex);
                        playSound();
                    }}
                    >
                    {`Mint ${character.name}`}
                </button>
                <div className="tooltip self-center text-gray-200" data-tip="Don't have ether ? Click me to get some for free.">
                    <div className="text-2xl">
                      <Link href="https://faucets.chain.link/rinkeby">
                        <a target="_blank"><AiOutlineQuestionCircle /></a>
                      </Link>
                    </div>
                  </div>
                <div className='flex flex-col my-3 gap-3'>

                    <div>
                        <div className="flex w-[100%] bg-gray-200 rounded-full h-2.5">
                            <div className={`bg-blue-600 h-2.5 rounded-full`} style={{width: hpBar}}></div>
                        </div>
                        <div className='flex font-bold justify-between text-gray-200'>
                            <div>
                                Health
                            </div>
                            <div>
                                {character.maxHp}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex w-[100%] bg-gray-200 rounded-full h-2.5">
                            <div className={`bg-blue-600 h-2.5 rounded-full`} style={{width: damageBar}}></div>
                        </div>
                        <div className='flex font-bold justify-between text-gray-200'>
                            <div>
                                Attack Damage
                            </div>
                            <div>
                                {character.attackDamage}
                            </div>
                        </div>
                    </div>
                </div>
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
                        className='hover:cursor-pointer drop-shadow-lg h-28 w-28 object-cover object-top'
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
            <div className="flex md:flex-row flex-col">
            <div className='flex flex-col md:w-[70vw] items-center'>
                <h1 className='text-3xl p-2 text-white mt-4'>
                    Mint your hero. Choose wisely. 
                </h1>
                {characters.length > 0 && (
                    // <div className='grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-3 p-2'
                    // >
                    <div className=''>
                        <div className='m-10 p-5 flex md:flex-wrap flex-row gap-1 '>
                            {renderCharacters()}
                        </div>
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
                {character && displayCharacter(character)}
             </div>
        </div>
    )
}

export default SelectCharacter;