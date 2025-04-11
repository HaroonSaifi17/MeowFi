import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, Eip1193Provider, ethers } from 'ethers';
import { IVault } from '../../../../backend/src/models/IVault';
import {
  useAppKitAccount,
  useAppKitNetworkCore,
  useAppKitProvider,
} from '@reown/appkit/react';
import { NFTabi, nativeTimeVaultAbi } from '@/lib/abi.data';
import { formatBalance } from '@/lib/VaultHelper';
import { toast } from 'sonner';
import { dataArr } from '@/lib/default';

export function VaultActions({ index }: { index: number }) {
  // const vaults: IVault[] = queryClient.getQueryData(['vaults'])!;
  const vaults: IVault[] = dataArr;
  const vault = vaults[index];

  const [quantity, setQuantity] = useState<number>(1);
  const [holdings, setHoldings] = useState<{
    tokenAmount: number;
    nftAmount: number;
  }>({
    tokenAmount: 0,
    nftAmount: 0,
  });

  const [joinTimeLeft, setJoinTimeLeft] = useState<string>('0d:0h:0m:0s');
  const [claimTimeLeft, setClaimTimeLeft] = useState<string>('0d:0h:0m:0s');

  const [userBalance, setUserBalance] = useState<string>('0');
  const [decimals, setdecimals] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);

  const [depositLoading, setDepositLoading] = useState<boolean>(false);
  const [withdrawLoading] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [availableSupply, setAvailableSupply] = useState<number>(
    vault.availableSupply
  );
  const [refresher, setRefresher] = useState<number>(0);

  useEffect(() => {
    async function fetchAvailableSupply() {
      try {
        const provider = new ethers.JsonRpcProvider(
          import.meta.env.VITE_ALCHEMY_URL
        );
        console.log(vault.proxyAddress);
        const proxyContract = new Contract(
          vault.proxyAddress,
          vault.abi,
          provider
        );
        const availableSupply = await proxyContract.getNftCount();
        console.log(availableSupply);
        setAvailableSupply(Number(availableSupply));
      } catch (error) {
        console.error('Error fetching available supply:', error);
      }
    }
    fetchAvailableSupply();
  }, [vault.proxyAddress, refresher]);

  const { isConnected, address } = useAppKitAccount();
  const { walletProvider }: { walletProvider: Eip1193Provider } =
    useAppKitProvider('eip155');
  const { chainId } = useAppKitNetworkCore();

  useEffect(() => {
    async function fetchBalance() {
      if (!address || !vault.tokenAddress || !walletProvider) return;

      setIsBalanceLoading(true);
      try {
        const provider = new BrowserProvider(walletProvider, chainId);
        console.log(vault.proxyAddress);
        const tokenContract = new Contract(
          vault.tokenAddress,
          vault.tokenAbi,
          provider
        );
        const decimal_ = await tokenContract.decimals();
        setdecimals(decimal_);

        const balance_ = await tokenContract.balanceOf(address);
        console.log(balance_);
        setUserBalance(balance_.toString())
      } catch (error) {
        console.error('Error fetching available supply:', error);
      }finally {
        setIsBalanceLoading(false);
      }
    }
    fetchBalance();
  }, [address, vault.tokenAddress, walletProvider, chainId, refresher]);

  useEffect(() => {
    async function fetchVaultHoldings() {
      if (!address || !vault.proxyAddress || !walletProvider) return;
      try {
        const provider = new BrowserProvider(walletProvider, chainId);
        const proxyContract = new Contract(
          vault.proxyAddress,
          vault.abi,
          provider
        );
        const result = await proxyContract.vaults(address);
        console.log(result)
        setHoldings({
          tokenAmount: result.tokenAmount || 0,
          nftAmount: parseFloat(result.nftAmount) || 0,
        });
      } catch (error) {
        console.error('Error fetching vault holdings:', error);
        setHoldings({ tokenAmount: 0, nftAmount: 0 });
      }
    }
    fetchVaultHoldings();
  }, [address, vault.proxyAddress, walletProvider, chainId, refresher]);
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchPeriod() {
      if (!address || !vault.proxyAddress || !walletProvider) return;

      try {
        const provider = new BrowserProvider(walletProvider, chainId);
        const proxyContract = new Contract(
          vault.proxyAddress,
          vault.abi,
          provider
        );

        // Fetch periods from contract
        const [_joiningPeriod, _claimingPeriod] = await Promise.all([
          proxyContract.joiningPeriod(),
          proxyContract.claimingPeriod(),
        ]);

        // Convert BigNumber to number
        const joiningPeriod = Number(_joiningPeriod);
        const claimingPeriod = Number(_claimingPeriod);

        if (joiningPeriod > 0 && claimingPeriod > 0) {
          // Immediate update
          updateCountdowns(joiningPeriod, claimingPeriod);

          // Set up interval for updates
          intervalId = setInterval(
            () => updateCountdowns(joiningPeriod, claimingPeriod),
            1000
          );
        }
      } catch (error) {
        console.error('Error fetching vault periods:', error);
        // Consider setting some error state here
      }
    }

    function updateCountdowns(joiningPeriod: number, claimingPeriod: number) {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds

      // Calculate remaining time
      const joinRemaining = joiningPeriod - now;
      const claimRemaining = claimingPeriod - now;

      // Format and update state
      setJoinTimeLeft(formatCountdown(joinRemaining));
      setClaimTimeLeft(formatCountdown(claimRemaining));
    }

    function formatCountdown(seconds: number): string {
      if (seconds <= 0) return '00d:00h:00m:00s';

      const days = Math.floor(seconds / (60 * 60 * 24));
      const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((seconds % (60 * 60)) / 60);
      const secs = Math.floor(seconds % 60);

      return `${days.toString().padStart(2, '0')}d:${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${secs.toString().padStart(2, '0')}s`;
    }

    fetchPeriod();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [address, vault.proxyAddress, walletProvider, chainId, refresher]);


  async function handleDeposit() {
    if (!isConnected) {
      toast('Please connect your wallet.');
      return;
    }
    setDepositLoading(true);
    try {
      const provider = new BrowserProvider(walletProvider, chainId);
      const signer = await provider.getSigner();
      const proxyContract = new Contract(
        vault.proxyAddress,
        vault.abi,
        signer
      );

      
      const depositTx = await proxyContract.joinVault(quantity, {
        value: (
          quantity *
          Number(vault.price) *
          10 ** Number(decimals)
        ).toString(),
      });
      const receipt = await depositTx.wait();
      if (receipt) {
        toast('Deposit successful', {
          description: 'You have successfully deposited',
        });
        setRefresher((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error during deposit:', error);
      toast('Deposit failed', {
        description: 'Please try again',
      });
    } finally {
      setDepositLoading(false);
    }
  }

  async function handleWithdraw() {
    // contract don't have withdraw function
  }

  async function handleClaim() {
    if (claimTimeLeft !== '00d:00h:00m:00s') {
      toast('Claim failed', {
        description: 'Claim period not started yet',
      });
      return;
    }
    if (!isConnected) {
      toast('Please connect your wallet.');
      return;
    }
    setClaimLoading(true);
    try {
      const provider = new BrowserProvider(walletProvider, chainId);
      const signer = await provider.getSigner();
      const proxyContract = new Contract(
        vault.proxyAddress,
        nativeTimeVaultAbi,
        signer
      );
      const NFTAddress = await proxyContract.nftAddress();
      if (!NFTAddress) {
        toast('Claim failed', {
          description: 'NFT contract not found',
        });
        return;
      }

      const nftContract = new Contract(NFTAddress, NFTabi, signer);

      const tx2 = await nftContract.setApprovalForAll(vault.proxyAddress, true);
      const conf2 = await tx2.wait();
      if (conf2) {
        const claimTx = await proxyContract.claimBack();
        const receipt = await claimTx.wait();
        if (receipt) {
          toast('Claim successful', {
            description: 'received your funds',
          });
        }
      }
      setRefresher((prev) => prev + 1);
      
    } catch (error) {
      console.error('Error during claim:', error);
      toast('Claim failed', {
        description: 'Please try again',
      });
    } finally {
      setClaimLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <p className="border-crimson border-y p-1 text-center font-semibold">
        {joinTimeLeft === '0d:0h:0m:0s'
          ? 'VAULT CLOSED'
          : `Vault Closes In: ${joinTimeLeft}`}
      </p>
      <div className="border-gunmetal bg-yellow flex justify-between rounded-lg border p-2 font-semibold">
        <span>Vault Supply:</span>
        <span className="font-Teko tracking-wider">
          {availableSupply}/{vault.totalSupply}
        </span>
      </div>
      <div className="border-gunmetal flex justify-between rounded-lg border bg-white p-1">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-2"
          disabled={quantity <= 1}
        >
          -
        </button>
        <div>{quantity}</div>
        <button
          onClick={() =>
            setQuantity(
              Math.min(vault.NFTLimit - holdings.nftAmount, quantity + 1)
            )
          }
          className="px-2"
          // disabled={quantity >= vault.availableSupply}
        >
          +
        </button>
      </div>
      <p className="-my-3 text-end text-sm">
        Balance:{' '}
        {isBalanceLoading
          ? 'Loading...'
          : `${formatBalance(userBalance, decimals).slice(0, 7)} ${vault.tokenSymbol}`}
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDeposit}
          className="hover:bg-amber/90 border-gunmetal bg-amber flex-1 rounded-lg border p-1 text-center font-semibold disabled:cursor-not-allowed disabled:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400"
          disabled={joinTimeLeft === '0d:0h:0m:0s' || depositLoading}
        >
          {depositLoading ? 'Depositing...' : 'Deposit'}
        </button>
        <button
          onClick={handleWithdraw}
          className="flex-1 rounded-lg border border-gray-400 p-1 text-center font-semibold text-gray-400 hover:bg-gray-100"
          disabled={withdrawLoading}
        >
          {withdrawLoading ? 'Withdrawing...' : 'Withdraw'}
        </button>
      </div>
      <div className="border-gunmetal flex flex-col overflow-hidden rounded-lg border">
        <div className="flex">
          <div className="border-gunmetal flex-1 border-r border-b p-1 text-center">
            Holdings
          </div>
          <div className="border-gunmetal flex-1 border-b p-1 text-center">
            Amount
          </div>
        </div>
        <div className="flex">
          <div className="border-gunmetal flex-1 border-r border-b p-1 text-center">
            {holdings.nftAmount} NFTs
          </div>
          <div className="border-gunmetal flex-1 border-b p-1 text-center">
            {ethers.formatUnits(holdings.tokenAmount, decimals)}{' '}
            {vault.tokenSymbol}
          </div>
        </div>
        <div className="bg-cream flex items-center justify-center gap-2 p-2 text-xs">
          <img width="20" height="20" src="/images/info.webp" alt="info" />
          You will be able to claim your initial funds along with the yield
          generated after the lock-up period.
        </div>
        <button
          onClick={handleClaim}
          className="bg-amber p-1"
          disabled={claimLoading}
        >
          {claimTimeLeft === '00d:00h:00m:00s'
            ? 'Claim'
            : claimLoading
              ? 'Claiming...'
              : `Claim Opens in: ${
                  vault.claimInPeriod.includes('T')
                    ? claimTimeLeft
                    : vault.claimInPeriod
                }`}
        </button>
      </div>
    </div>
  );
}
