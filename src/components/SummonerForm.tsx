import styled from "styled-components";
import { FieldValues } from "react-hook-form";
import { ethers } from "ethers";

import { H2, Link, ParMd, SingleColumnLayout, useToast } from "@daohaus/ui";
import { FormBuilder, StatusMsg } from "@daohaus/form-builder";
import { APP_FORM } from "../legos/forms";
import { TARGET_DAO } from "../targetDao";
import { AppFieldLookup } from "../legos/fieldConfig";
import { useState } from "react";
import { useTxBuilder } from "@daohaus/tx-builder";
import { ReactSetter, handleErrorMessage } from "@daohaus/utils";
import { APP_CONTRACT } from "../legos/contract";
import { useDHConnect } from "@daohaus/connect";
import { assembleTxArgs } from "../utils/summonHelpers";
import { SummonStates } from "../pages/Home";
import { NavLink } from "react-router-dom";

const LinkBox = styled.div`
  display: flex;
  width: 50%;
  justify-content: space-between;
`;

const LinkTo = styled(NavLink)`
  color: hsl(43, 100%, 64%);
  cursor: pointer;
  display: inline-flex;
  font-family: "Mulish", sans-serif;
  font-weight: 400;
  font-size: 1.6rem;
`;

type SummonFormProps = {
  setSummonState: ReactSetter<SummonStates>;
  setTxHash: ReactSetter<string>;
  setDaoAddress: ReactSetter<string>;
  setTokenAddress: ReactSetter<string>;
  setErrMsg: ReactSetter<string>;
};

export const SummonerForm = ({
  setSummonState,
  setTxHash,
  setDaoAddress,
  setTokenAddress,
  setErrMsg,
}: SummonFormProps) => {
  const { fireTransaction } = useTxBuilder();
  const { provider, address } = useDHConnect();
  const { defaultToast, errorToast, successToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<null | StatusMsg>(null);

  const handleSubmit = async (formValues: FieldValues) => {
    {
      {
        setIsLoading(true);
        setTxHash("");
        setStatus(StatusMsg.Compile);

        const args = assembleTxArgs(
          formValues,
          TARGET_DAO.CHAIN_ID,
          address,
          TARGET_DAO.SQUAD
        );
        const executed = await fireTransaction({
          tx: {
            id: "SUMMON",
            contract: APP_CONTRACT.BAALSUMMONER,
            method: "summonBaalFromReferrer",
            staticArgs: args,
          },
          lifeCycleFns: {
            onRequestSign() {
              setStatus(StatusMsg.Request);
            },
            onTxHash(txHash) {
              setTxHash(txHash);
              setStatus(StatusMsg.Await);
            },
            onTxError(error) {
              setStatus(StatusMsg.TxErr);
              const errMsg = handleErrorMessage({
                error,
                fallback: "Could not decode error message",
              });
              setIsLoading(false);
              setErrMsg(errMsg);
              errorToast({ title: StatusMsg.TxErr, description: errMsg });
            },
            onTxSuccess(...args) {
              console.log("args", args);
              const tx1 = args[0].logs.find(
                (item) =>
                  item.topics.indexOf(
                    "0xcf2f09cd0dbc149b12a3630a11b7d73476660f3d08d3dc7dcc79c6dec555ee7a" //SummonBaal
                  ) > -1
              );
              const daoHexString =
                tx1?.topics[1] && tx1.topics[1].indexOf("0x") > -1
                  ? tx1?.topics[1]
                  : "0x" + tx1?.topics[1];

              const daoAddress = ethers.utils.hexStripZeros(daoHexString);
              console.log("daoAddress", daoAddress);

              const tokenHexString =
                tx1?.topics[3] && tx1.topics[3].indexOf("0x") > -1
                  ? tx1?.topics[3]
                  : "0x" + tx1?.topics[3];

              const tokenAddress = ethers.utils.hexStripZeros(tokenHexString);
              console.log("tokenAddress", tokenAddress);

              setStatus(StatusMsg.TxSuccess);
              if (daoAddress) {
                successToast({
                  title: "DAO Summoned",
                  description: "Your Moloch V3 has been summoned!",
                });
                setSummonState("success");
                setDaoAddress(daoAddress);
              }
              if (tokenAddress) {
                setTokenAddress(tokenAddress);
              }
            },
          },
        });
        if (executed === undefined) {
          setStatus(StatusMsg.NoContext);
          return;
        }
        return executed;
      }
    }
  };

  return (
    <>
      <FormBuilder
        form={APP_FORM.SUMMON}
        targetNetwork={TARGET_DAO.CHAIN_ID}
        customFields={AppFieldLookup}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
      />

      <LinkTo style={{ marginTop: "2em" }} to="learn">
        Learn about the Big Squad DAO
      </LinkTo>
    </>
  );
};