'use client'
import { TProject } from '@/types/project'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers';
import React from 'react'
import tokenAbi from '@/abi/token.abi.json'
import { Button } from '@/components/ui/button';
import axios from 'axios';
export default function BtnDeploy({ data }: { data: TProject }) {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  if (!walletClient) return
  const provider = new ethers.BrowserProvider(walletClient)
  async function handleDeploy() {
    // const apiUrl = `https://api.gnosisscan.io`
    const signer = await provider.getSigner(address)
    const tokenFactory = new ethers.ContractFactory(tokenAbi.abi, tokenAbi.bytecode, signer);

    const token = await tokenFactory.deploy(
      data.name,
      data.ticker,
      data.totalSupply
    );
    await token.waitForDeployment();
    const contractAddress = await token.getAddress()
    const encodedConstructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "string", "uint256"],
      [
        data.name,
        data.ticker,
        data.totalSupply
      ]
    ).slice(2);
    const sourceCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply)
        ERC20(name, symbol)
    {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}`
    
    const res = await axios.post(
      'https://api.etherscan.io/v2/api',
      new URLSearchParams({
        apikey: '9XFQQ3T7TGMK88RVIRIA4JUNQBXIP4QXIA',
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: contractAddress,
        sourceCode: sourceCode,
        codeformat: 'solidity-single-file',
        contractname: data.name,
        compilerversion: 'v0.8.24+commit.e11b9ed9',
        optimizationUsed: '0',
        runs: '200', // default jika optimasi aktif
        constructorArguments: encodedConstructorArgs,
      }));
    console.log({
      res,
      encoded: encodedConstructorArgs,
      contractAddress
    })
  }
  return (
    <div>
      <Button onClick={handleDeploy}>Click</Button>
    </div>
  )
}
