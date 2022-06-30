import React, {useState, useEffect} from 'react';
import myEpicGame from '../../utils/MyEpicGame.json'; // smart contract im interacting with (need the abi)
import { ethers } from 'ethers'; //  cuz im interacting with the smart contract
import { CONTRACT_ADDRESS, transformCharacterData, transformBossData } from '../../constants'; // need the contract address to set up the connection with the smart contract
import LoadingIndicator from '../LoadingIndicator';

import useSound from 'use-sound';
import battleSound from '../../sounds/battleSound.mp3';
import attackSound from '../../sounds/attackSound.mp3';

const Arena = ({characterNFT, setCharacterNFT, currentAccount}) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [playAttackSound] = useSound(attackSound,{
            volume: 0.035
        });
    const [playBattleSound] = useSound(battleSound, {
            volume: 0.035
        });
    let animation = {
        attacking: "animate-spin",
        attacked: ""
    }

    /*
    * We are going to use this to add a bit of fancy animations during attacks
    */
    const [attackState, setAttackState] = useState('');

    const fetchCharacterNftDisplayData = () => {
        return (
            <div className="flex flex-col p-10">
                <div className="card glass h-fit w-auto shadow-xl flex flex-col">
                    {/* <h2 className='text-black text-2xl place-self-center'>Your Character</h2> */}
                        <div className='text-xl p-1 text-black place-self-center border-b-2 border-gray-200'>
                            Your Character
                        </div>
                        <h2 className='text-black font-semibold text-2xl p-2 place-self-center'>{characterNFT.name}</h2>
                        <figure>
                            <img 
                                src={characterNFT.imageURI} 
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
            </div>);
    }
    const fetchBossNftDisplayData = () => {
        return (<div className="flex lg:flex-row flex-col p-10">
                    <div className={`card glass h-fit w-auto shadow-xl flex flex-col ${attackState}`}>
                        <h1 className='text-black font-bold p-2 text-2xl place-self-center'>🔥 {boss.name} 🔥</h1>
                        <figure>
                            <img 
                                src={boss.imageURI} 
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
                console.log(nftHolders);
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
            console.log(gameContract);
        } else {
            console.log('Ethereum object not found');
        }
    }, []);
    // useEffect( () => {
    //     playBattleSound();
    // });
    useEffect( () => {
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            const boss = transformBossData(bossTxn);
            console.log("Boss data: ", boss);
            setBoss(boss);
        };

        const onAttackComplete = (from, newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            const sender = from.toString();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            /*
            * If player is our own, update both player and boss Hp
            */
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
            gameContract.on('AttackComplete', onAttackComplete);
        }

        /*
        * Make sure to clean up this event when this component is removed
        */
        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        };
    }, [gameContract]);


    return (
        <div className="min-h-screen bg-[url('https://i.pinimg.com/originals/0f/18/c4/0f18c45e07a7212f4d49e71213833e01.jpg')] bg-cover flex flex-row justify-between"> 
            <div className='flex flex-col'>
                <div className='flex md:flex-row flex-col w-auto'>
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
                <div className='place-self-center p-4 w-auto flex-nowrap'>
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
            <div className='flex flex-col w-[40vw] font-bold text-3xl text-black justify-center items-center p-5 mr-10'>
                <div>
                    Leaderboards
                </div>
                <div>
                    Coming up soon.
                </div>
            </div>
        </div>
    );
}

export default Arena;



