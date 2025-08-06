/**
 * Initial creators for the TippingChain demo
 * These creators should be registered via the admin panel or through contract deployment
 */

export interface InitialCreator {
  id: number;
  wallet: string;
  tier: number;
  description: string;
  name?: string;
}

export const INITIAL_CREATORS: InitialCreator[] = [
  {
    id: 1, // Assuming this will be creator ID 1
    wallet: '0x479945d7931baC3343967bD0f839f8691E54a66e',
    tier: 0, // Tier 1 (60/40 split)
    description: 'Initial demo creator',
    name: 'Demo Creator'
  }
];

export const getInitialCreatorByWallet = (wallet: string): InitialCreator | undefined => {
  return INITIAL_CREATORS.find(c => c.wallet.toLowerCase() === wallet.toLowerCase());
};

export const getInitialCreatorById = (id: number): InitialCreator | undefined => {
  return INITIAL_CREATORS.find(c => c.id === id);
};