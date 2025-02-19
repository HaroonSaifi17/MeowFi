const cardData: {
  title: string;
  image: string;
  stats: {
    earnings: string;
    newAPR: string;
    lockedInPeriod: string;
  };
  total: string;
  price: string;
}[] = [
  {
    title: 'Breadrome Vault',
    image:
      'https://obya3wwefi.ufs.sh/f/vL3P6gZND4Zgk0k22aUecDBQfJuzqRPWyTwXspj01m3Li5nr',
    stats: {
      earnings: '14%',
      newAPR: '0.5%',
      lockedInPeriod: '30 days',
    },
    total: '10',
    price: '$100',
  },
  {
    title: 'Breadrome Vault',
    image:
      'https://obya3wwefi.ufs.sh/f/vL3P6gZND4ZgnSMRMHrZbIPCng039uaFWQYG8AyrMzoeqsfw',
    stats: {
      earnings: '14%',
      newAPR: '0.5%',
      lockedInPeriod: '30 days',
    },
    total: '14',
    price: '$100',
  },
  {
    title: 'Berafrome Vault',
    image:
      'https://obya3wwefi.ufs.sh/f/vL3P6gZND4Zgk0k22aUecDBQfJuzqRPWyTwXspj01m3Li5nr',
    stats: {
      earnings: '14%',
      newAPR: '0.5%',
      lockedInPeriod: '30 days',
    },
    total: '11',
    price: '$100',
  },
];

export interface VaultData {
  title: string;
  type: string;
  vaultName: string;
  points: number;
  isAirdropIncentivised: boolean;
  yieldGenerated: number;
  yieldUnit: string;
  timeLock: number; // in days
  backingRatio: number;
  backingPercentage: number;
  vaultClosesIn: string;
  vaultInfo: {
    amount: number;
    pricePerUnit: number;
    currency: string;
  };
  vaultSupply: {
    current: number;
    total: number;
  };
  balance: number;
  depositAmount: number;
  claimOpensIn: string;
}

const vaultData: VaultData = {
  title: 'Burger Math',
  type: 'Flexible',
  vaultName: 'TomatoLend',
  points: 5,
  isAirdropIncentivised: true,
  yieldGenerated: 1.4,
  yieldUnit: 'ETH',
  timeLock: 60,
  backingRatio: 1.36,
  backingPercentage: 36,
  vaultClosesIn: '2d:15h:16m:30s',
  vaultInfo: {
    amount: 1400,
    pricePerUnit: 100,
    currency: 'ETH',
  },
  vaultSupply: {
    current: 1000,
    total: 1400,
  },
  balance: 0.10303,
  depositAmount: 2,
  claimOpensIn: '59d:15h:16m:30s',
};

export { cardData, vaultData };
