const CONTRACT_ADDRESS = '0x8202D8A1BBaD626C6abf60C2447D6598fd1060A2';

const transformCharacterData = (characterData) => {
    return {
      name: characterData.name,
      imageURI: characterData.imageURI,
      hp: characterData.hp.toNumber(),
      maxHp: characterData.maxHp.toNumber(),
      energy: characterData.energy.toNumber(),
      maxEnergy: characterData.maxEnergy.toNumber(),
      attackDamage: characterData.attackDamage.toNumber(),
      hpHealingFactor: characterData.hpHealingFactor.toNumber()
    };
  };

  const transformBossData = (bossData) => {
    return {
      name: bossData.name,
      imageURI: bossData.imageURI,
      hp: bossData.hp.toNumber(),
      maxHp: bossData.maxHp.toNumber(),
      energy: bossData.energy.toNumber(),
      maxEnergy: bossData.maxEnergy.toNumber(),
      attackDamage: bossData.attackDamage.toNumber()
    };
  }
  
  export { CONTRACT_ADDRESS, transformCharacterData, transformBossData };
  