/* eslint-disable @next/next/no-img-element */
import React, {useState, useEffect} from 'react';
import myEpicGame from '../../utils/MyEpicGame.json'; // smart contract im interacting with (need the abi)
import { ethers } from 'ethers'; //  cuz im interacting with the smart contract
import { CONTRACT_ADDRESS, transformCharacterData, transformBossData } from '../../constants'; // need the contract address to set up the connection with the smart contract
import LoadingIndicator from '../LoadingIndicator';

import useSound from 'use-sound';
import battleSound from '../../sounds/battleSound.mp3';
import attackSound from '../../sounds/attackSound.mp3';
import { list } from 'postcss';

const Arena = ({characterNFT, setCharacterNFT, currentAccount}) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [playersDamageData, setPlayersDamageData] = useState([]);
    const [attackState, setAttackState] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [playAttackSound] = useSound(attackSound,{
        volume: 0.035
    });

    const renderLeaderBoards = () => {
        console.log("inside renderLeaderboards");
        console.log(playersDamageData);
        let c=0;
        return (<table className='table w-full m-5' data-theme="light">
                <thead>
                    <tr>
                        <th>
                            S. No.
                        </th>
                        <th>
                            Wallet Address
                        </th>
                        <th>Total Damage</th>
                    </tr>
                </thead>
                <tbody >
                    {
                    playersDamageData.map((item) => {
                        return (<tr key={item.playerAddress}>
                            <th className='font-normal'>{++c}</th>
                            <th className='font-normal'>{item.playerAddress}</th>
                            <th className='font-normal'>{item.playerTotalDamage}</th>
                        </tr>)
                    })
                }
                </tbody>
        </table>)
    }
    const fetchCharacterNftDisplayData = () => {
        let visibility = "invisible";
        if(characterNFT.hp === 0){
            visibility="visilbe"
        }
        return (
        <div className='flex flex-col items-center'>
            <div className="flex lg:flex-row flex-col p-10">
                <div className="card glass h-fit w-full shadow-xl flex flex-col">
                    {/* <h2 className='text-black text-2xl place-self-center'>Your Character</h2> */}
                        <div className='text-xl p-1 text-black place-self-center border-b-2 border-gray-200'>
                            Your Character
                        </div>
                        <h2 className='text-black font-semibold text-2xl p-2 place-self-center'>{characterNFT.name}</h2>
                        <figure>
                            <img 
                                src={`https://nftstorage.link/ipfs/${characterNFT.imageURI}`}  
                                alt={`Character ${characterNFT.name}`} 
                                />
                        </figure>
                        <div className="card-actions m-5">
                            <progress className="progress progress-error w-56" value={characterNFT.hp} max={characterNFT.maxHp} />
                            <p className="text-black text-lg badge badge-outline">{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                        </div>

                        <div className="mb-5 place-self-center">
                            <h4 className='place-self-center p-2 text-black'
                            >{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
                        </div>
                </div>
            </div>
            <button 
                className={`${visibility} btn btn-outline md:w-[60%] w-auto`} 
                data-theme="light"
                onClick={() => setCharacterNFT(undefined)}>
                Mint a new character
            </button>
        </div>
        );
    }
    const fetchBossNftDisplayData = () => {
        return (<div className="flex lg:flex-row flex-col p-10">
                    <div className={`card glass h-fit w-full shadow-xl flex flex-col ${attackState}`}>
                        <h1 className='text-black font-bold p-2 text-2xl place-self-center'>🔥 {boss.name} 🔥</h1>
                        <figure>
                            <img 
                                src={`https://nftstorage.link/ipfs/${boss.imageURI}`}  
                                alt={`Boss ${boss.name}`} 
                                />
                        </figure>
                        <div className="card-actions m-5">
                            <progress className="progress progress-error w-56" value={boss.hp} max={boss.maxHp} />
                            <p className="text-black text-lg badge badge-outline">{`${boss.hp} / ${boss.maxHp} HP`}</p>
                        </div>
                        <div className="mb-5 place-self-center">
                                <h4 className='place-self-center p-2 text-black'
                                >{`⚔️ Attack Damage: ${boss.attackDamage}`}</h4>
                            </div>
                    </div>
                </div>
                );
    }

    const runAttackAction = async () => {
        try {
            if (gameContract) {
            setAttackState('attacking');
            console.log('Attacking boss...');
            const attackTxn = await gameContract.attackBoss();
            await attackTxn.wait();
            console.log('attackTxn:', attackTxn);
            setAttackState('hit');

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
        }
          } catch (error) {
            console.error('Error attacking boss:', error);
            setAttackState('');
          }
        
    };

    useEffect( () =>  {
        const fetchHeroes = async () => {
            try{
                let nftHolders = await gameContract.nftHolders("0x93DF3b6bF8fAA16502f2766cE6C6881be2A82f7B");
            }
            catch(error){
                console.log("error fetching nftHolders from smart contract", error);
            }
        };
        if(gameContract){
            fetchHeroes();
        }
    });

    useEffect( () => {
        const { ethereum } = window;
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                myEpicGame.abi,
                signer
            );
            setGameContract(gameContract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);
    useEffect( () => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            const boss = transformBossData(bossTxn);
            console.log("Boss data: ", boss);
            setBoss(boss);
        };
        // const onCriticalHit = () => {
        //     setBoss((prevState) => {
        //         return { ...prevState, hp: bossHp };
        //     });
        //     setCharacterNFT((prevState) => {
        //         return { ...prevState, hp: playerHp };
        //     });
        // }

        const getAllPlayersData = async () => {
            try{
                let tempPlayersDamageData = [];
                let allPlayers = await gameContract.getAllPlayers();
                for(let i=0; i < allPlayers.length; i++) {
                    const playerAddress = allPlayers[i];
                    const playerAttackDamage = await gameContract.totalAttackDamage(playerAddress);
                    console.log("playerAddress", allPlayers[i]);
                    console.log("playerTotalDamage", playerAttackDamage.toNumber());
                    tempPlayersDamageData.push({
                        playerAddress: playerAddress,
                        playerTotalDamage: playerAttackDamage.toNumber()
                    })
                }
                console.log("All players", allPlayers);
                setPlayersDamageData(tempPlayersDamageData);
                console.log("playersDamageData", playersDamageData);
                
            }
            catch(error){
                console.log(error);
            }
        }


        const onAttackComplete = (from, newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            const sender = from.toString();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            /*
            * If player is our own, update both player and boss Hp
            */
            getAllPlayersData();
            if (currentAccount === sender.toLowerCase()) {
              setBoss((prevState) => {
                  return { ...prevState, hp: bossHp };
              });
              setCharacterNFT((prevState) => {
                  return { ...prevState, hp: playerHp };
              });
            }
            /*
            * If player isn't ours, update boss Hp only
            */
            else {
              setBoss((prevState) => {
                  return { ...prevState, hp: bossHp };
              });
            }
        }

        if (gameContract) {
            fetchBoss();
            getAllPlayersData();
            gameContract.on('AttackComplete', onAttackComplete);
            // gameContract.on('CriticalHit', onCriticalHit);
        }

        /*
        * Make sure to clean up this event when this component is removed
        */
        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
                // gameContract.off('CriticalHit', onCriticalHit);
            }
        };
    }, [gameContract]);

    useEffect(()=>{
        if(characterNFT.hp === 0){
            
        }
    });


    return (
        <div className="min-h-screen bg-[url('https://i.pinimg.com/originals/0f/18/c4/0f18c45e07a7212f4d49e71213833e01.jpg')] bg-cover"> 
            <div className='flex flex-col justify-between'>
                <div className='font-bold text-black text-3xl place-self-center self-center mt-4'>Battle Arena</div>
                <div className='flex flex-col w-auto items-center'>
                    <div className='grid lg:grid-cols-2 grid-cols-1'>
                        {characterNFT && fetchCharacterNftDisplayData()}
                        {boss && fetchBossNftDisplayData()}
                    </div>

                    {boss && characterNFT && (
                        <div id="toast" className={showToast ? 'show' : ''}>
                            <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
                        </div>
                    )}

                    {attackState === 'attacking' && (
                            <div className="loading-indicator place-self-center text-black">
                                <LoadingIndicator />
                                <p>⚔️ Attacking ⚔️</p>
                            </div>
                        )}
                    <div className='p-4 w-auto flex-nowrap'>
                        {attackState === "attacking" && <span className="p-2 h-3 w-3">
                                    <span className="animate-ping absolute h-5 w-5 rounded-full bg-yellow-400 opacity-75"></span>
                                    <span className="absolute rounded-full h-4 w-4 bg-yello-500"></span>
                                </span>}
                        {boss && <button 
                            className={`btn btn-warning text-xl flex-nowrap`} 
                            onClick={ () => 
                                    {
                                        playAttackSound();
                                        runAttackAction();
                                    }
                                }>
                                {`💥 Attack ${boss.name}`}
                        </button>}
                </div>

                </div>         
                <div className='flex flex-col justify-center items-center p-5 mr-10'>
                    <div className='font-bold text-3xl text-black'>
                        Leaderboards (WIP)
                    </div>
                    {playersDamageData && playersDamageData.length > 0 && 
                            renderLeaderBoards()
                    }
                </div>
            </div>
        </div>
    );
}

export default Arena;



