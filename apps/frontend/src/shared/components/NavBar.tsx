import { Link, NavLink } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Soon from '@/components/ui/soon';
import { LuEllipsis, LuMenu } from 'react-icons/lu';
import Manual from '@/components/Manual';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import Avatar from './svg/Avatar';
import WaterTap from './svg/WaterTap';
import BribeDialog from '@/features/bribe/components/BribeDialog';
import { useEffect } from 'react';

const navLinks = [
  { label: 'Time Vaults', to: '/' },
  { label: 'Liquid Launch', soon: true },
  { label: 'Bribe Wars', soon: true },
];
const manualLinks: { key: string; value: string }[] = [
  { key: 'Docs', value: 'https://docs.meowfi.xyz' },
  { key: 'Twitter', value: 'https://x.com/MeowFi_' },
  { key: 'Discord', value: 'https://discord.com/invite/RZWntTWFrb' },
];
const mobileNavItemClass =
  'bg-cream text-chocolate border-orange font-Bubblegum relative flex h-[42px] w-full items-center justify-center gap-1 rounded-xl border-2 px-3 hover:hue-rotate-180';

export default function NavBar() {
  const { open } = useAppKit();
  const { isConnected, address } = useAppKitAccount();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const refCode = localStorage.getItem('referralCode') || ref;
    if (isConnected) {
      if (refCode) {
        (async () => {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/referral/success`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refCode, walletAddress: address }),
            });
          } catch (error) {
            console.error('Referral API call failed:', error);
          }
        })();
      }
    }
  }, [isConnected, address]);

  return (
    <nav className="relative z-30 px-[3vw]">
      <div className="mx-auto flex max-w-7xl items-center justify-between py-6">
        {/* Logo and Desktop Navigation */}
        <div className="flex gap-4">
          <NavLink
            to="/"
            className="font-Showcard text-center text-2xl leading-6 font-bold tracking-wider text-white uppercase duration-50 hover:scale-[1.01]"
          >
            <img width="70px" src="/images/logo.webp" alt="logo" />
          </NavLink>
          <div className="[&>a]:bg-cream [&>a]:text-chocolate [&>a]:border-yellow [&>a]:font-Bubblegum flex items-center gap-2 text-sm max-[870px]:hidden max-lg:gap-1 [&>a]:relative [&>a]:flex [&>a]:items-center [&>a]:rounded-xl [&>a]:border-2 [&>a]:px-3 [&>a]:py-2 [&>a]:hover:hue-rotate-180">
            {navLinks.map(({ label, to }) =>
              to ? (
                <NavLink key={label} to={to}>
                  {label}
                </NavLink>
              ) : (
                <a key={label}>
                  <Soon />
                  {label}
                </a>
              )
            )}
          </div>
        </div>

        {/* Chain Select, Connect Wallet & Manual Dropdown */}
        <div className="max-[550px]:bg-cream bottom-0 left-0 z-30 flex items-center gap-2 max-[550px]:fixed max-[550px]:w-full max-[550px]:p-2 max-[550px]:px-6 [&>button]:rounded-xl">
          <Link
            className="bg-sky rounded-xl border-2 border-white p-2"
            to="/faucet"
          >
            <WaterTap />
          </Link>
          <div className="[&>button]:bg-cream [&>button]:border-light-orange [&>button]:text-chocolate [&>button]:font-Bubblegum max-[550px]:order-2 [&>button]:rounded-xl [&>button]:border-2 [&>button]:p-5 [&>button]:px-1 [&>button]:pl-0 max-[550px]:[&>button]:py-[19px]">
            <Select defaultValue="Monad">
              <SelectTrigger>
                <div className="[&>*]:font-Bubblegum overflow-hidden max-[550px]:w-8">
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="border-gunmetal rounded-xl border-1">
                <SelectGroup>
                  <SelectItem
                    className="[&>*]:font-Bubblegum [&>*]:text-chocolate"
                    value="Monad"
                  >
                    <div className="font-Bubblegum ml-2 flex gap-2">
                      <img width="20px" src="/images/monad.webp" alt="Monad" />
                      Monad
                    </div>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <span className="flex items-center" onClick={() => open()}>
            {!isConnected ? (
              <a className="font-Bubblegum hover:bg-yellow/95 border-cream bg-yellow text-gunmetal flex items-center rounded-xl border p-2 px-2 text-center text-sm leading-6 tracking-wider text-nowrap max-[550px]:order-1">
                Connect Wallet
              </a>
            ) : (
              <a className="to-amber from-orange inline-block aspect-square w-10 rounded-full bg-gradient-to-b">
                <Avatar />
              </a>
            )}
          </span>
          <div className="order-3 hidden flex-1 justify-end max-[550px]:flex">
            <DropdownMenu>
              <DropdownMenuTrigger className="bg-cream border-light-orange hidden aspect-square items-center justify-center rounded-xl border px-2 py-1 max-[870px]:flex">
                <LuEllipsis size="25px" className="text-light-orange" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-cream border-gunmetal relative mx-[3vw] flex flex-col rounded-xl border-2 py-6 pt-12 [&>div]:px-8">
                <Dialog>
                  <DialogTrigger
                    asChild
                    className="bg-yellow hover:!bg-yellow/90 px-auto absolute top-0 left-0 w-full cursor-pointer justify-center rounded-b-lg p-1 pt-4 !text-center font-bold"
                  >
                    <div>Manual</div>
                  </DialogTrigger>
                  <Manual />
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="my-2 mb-1 w-full text-center font-semibold">
                      Bribes
                    </button>
                  </DialogTrigger>
                  <BribeDialog />
                </Dialog>
                {manualLinks.map((item) => (
                  <DropdownMenuItem key={item.key}>
                    <a
                      href={item.value}
                      className="w-full text-center font-semibold"
                    >
                      {item.key}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-cream hidden aspect-square items-center justify-center rounded-xl px-2 py-1 max-[870px]:flex">
            <LuMenu size="25px" className="text-light-orange" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-cream border-gunmetal mx-[3vw] flex flex-col gap-4 rounded-2xl border-2 py-6 [&>div]:px-6">
            {navLinks.map(({ label, to }) => (
              <DropdownMenuItem key={label}>
                {to ? (
                  <NavLink className={mobileNavItemClass} to={to}>
                    {label}
                  </NavLink>
                ) : (
                  <a className={mobileNavItemClass}>
                    <Soon />
                    {label}
                  </a>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
