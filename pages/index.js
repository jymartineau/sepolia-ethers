import { ethers } from "ethers";
import React, { useState } from "react";
import ecommerceABI from "../abi/ecommerceABI.json";

export default function Home() {
  const [vendorAddress, setVendorAddress] = useState("");
  const [transactionHash, setTransactionHash] = useState("");

  // Function to get a provider or signer
  function getProviderOrSigner(needSigner = false) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    return needSigner ? provider.getSigner() : provider;
  }

  const ecommerceContractAddress = "0x64d2a0fc781cfbb4ecfca300f56b677e612e29fd";
  // const ecommerceABI = [
  //   // ABI contents here. For brevity, only include the relevant functions
  //   "function purchase(address vendor) public payable",
  //   "event Purchase(address indexed vendor, uint256 value)",
  // ];

  async function purchaseItem(vendorAddress, amountInEther) {
    if (!window.ethereum) return alert("Please install MetaMask");

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const signer = getProviderOrSigner(true);
      const ecommerceContract = new ethers.Contract(
        ecommerceContractAddress,
        ecommerceABI,
        signer
      );

      const transactionResponse = await ecommerceContract.purchase(
        vendorAddress,
        {
          value: ethers.utils.parseEther(amountInEther),
        }
      );

      await transactionResponse.wait(); // Wait for the transaction to be mined
      console.log("Purchase successful", transactionResponse);
    } catch (error) {
      console.error("Transaction failed", error);
    }
  }

  const handlePurchase = async (event) => {
    event.preventDefault(); // Prevent the form from submitting traditionally
    setTransactionHash(""); // Reset transaction hash to ensure UI updates correctly for multiple uses
    console.log("ethers: ", ethers);
    console.log("ethers utils: ", ethers.utils);

    if (!ethers.utils.isAddress(vendorAddress)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }

    try {
      const hash = await purchaseItem(vendorAddress, "0.025"); // Assuming purchaseItem now returns the transaction hash
      setTransactionHash(hash); // Update state with the transaction hash
    } catch (error) {
      console.error("Transaction failed", error);
      alert("Transaction failed. See console for details.");
    }
  };

  return (
    <div className="p-16">
      <h1 className="py-4 text-2xl font-semibold">
        Sepolia Live Test Home Page
      </h1>

      <form className="p-4 bg-slate-100" onSubmit={handlePurchase}>
        <label
          htmlFor="vendorAddress"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          Vendor&apos;s Ethereum Address:
        </label>
        <input
          type="text"
          id="vendorAddress"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={vendorAddress}
          onChange={(e) => setVendorAddress(e.target.value)}
          placeholder="0x..."
          required
        />
        <button
          type="submit"
          className="my-3 px-4 py-2 bg-green-500 hover:bg-green-800 rounded-md hover:text-white">
          Purchase
        </button>
      </form>
      {transactionHash && (
        <div className="my-8 p-8 bg-gray-400 rounded-md border border-gray-700">
          <p>Transaction successful!</p>
          <p>Transaction Hash: {transactionHash}</p>
        </div>
      )}
    </div>
  );
}
