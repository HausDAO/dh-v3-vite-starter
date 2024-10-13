import { useMemo } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";

// import { DHLayout, useDHConnect } from "@daohaus/connect";
import { TXBuilder } from "@daohaus/tx-builder";
import { ValidNetwork } from "@daohaus/keychain-utils";
import { CurrentDaoProvider, useDaoData } from "@daohaus/moloch-v3-hooks";
// import { HeaderAvatar } from "../HeaderAvatar";
import { ConnectKitButton } from "connectkit";
import { useAccount, usePublicClient } from "wagmi";

export const DaoContainer = () => {
  const { proposalId, memberAddress, daoChain, daoId } = useParams<{
    daoChain: ValidNetwork;
    daoId: string;
    proposalId: string;
    memberAddress: string;
  }>();

  if (!daoId || !daoChain) return null;

  return (
    <Dao
      daoId={daoId}
      daoChain={daoChain}
      proposalId={proposalId}
      memberAddress={memberAddress}
    />
  );
};

const Dao = ({
  daoId,
  daoChain,
  proposalId,
  memberAddress,
}: {
  daoId: string;
  daoChain: ValidNetwork;
  proposalId?: string;
  memberAddress?: string;
}) => {
  const location = useLocation();

  // const { publicClient, address } = useDHConnect();
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { dao } = useDaoData({
    daoId: daoId as string,
    daoChain: daoChain as string,
  });

  const routePath = `molochv3/${daoChain}/${daoId}`;

  const navLinks = useMemo(() => {
    let baseLinks = [
      { label: "Home", href: `/` },
      { label: "DAO", href: `/${routePath}` },
      { label: "Safes", href: `/${routePath}/safes` },
      { label: "Proposals", href: `/${routePath}/proposals` },
      { label: "Members", href: `/${routePath}/members` },
      { label: "Settings", href: `/${routePath}/settings` },
    ];

    return address
      ? [
          ...baseLinks,
          { label: "Profile", href: `/${routePath}/member/${address}` },
        ]
      : baseLinks;
  }, [daoChain, daoId, address]);

  return (
    // <DHLayout
    //   pathname={location.pathname}
    //   navLinks={navLinks}
    //   leftNav={
    //     dao?.name &&
    //     dao?.id && (
    //       <HeaderAvatar
    //         name={dao.name}
    //         address={dao.id}
    //         imgUrl={dao?.avatarImg}
    //       />
    //     )
    //   }
    // >
    <>
      <ConnectKitButton />
      <CurrentDaoProvider
        userAddress={address}
        targetDao={{
          daoChain: daoChain,
          daoId: daoId,
          proposalId,
          memberAddress,
        }}
      >
        <TXBuilder
          publicClient={publicClient}
          chainId={daoChain}
          daoId={daoId}
          safeId={dao?.safeAddress}
          appState={{ dao, memberAddress: address }}
        >
          <Outlet />
        </TXBuilder>
      </CurrentDaoProvider>
    </>
    // </DHLayout>
  );
};
