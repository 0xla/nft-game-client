const CONTRACT_ADDRESS = '0x3D929a6785b221AD124CB4280cCF369ae914A10e';

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
  