import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Rocket, CheckCircle2, ArrowRight, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { parseEther } from "viem";
import ContractABI from "../abi/purchasesuffix.json";
import WalletConnect from "../provider/Wallet.jsx";

const CreateWallet = () => {
  const [contractSuffix, setContractSuffix] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [suggestion, setSuggestion] = useState<string[]>([]);
  const [txnHash, setTxnHash] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { address, isConnected } = useAccount();

  // Enhanced hexadecimal validation with error handling
  const isHexadecimal = (str: string) => /^[0-9a-fA-F]+$/.test(str);

  // Improved input handling with async/await
  const handleSuffixChange = (value: string) => {
    setContractSuffix(value);

    if (!isHexadecimal(value)) {
      const fallbackSuggestions = generateFallbackSuggestions(value, 4); // Generate 4 suggestions
      setSuggestion(fallbackSuggestions);
    } else {
      setSuggestion([]); // Clear suggestions for valid input
    }
  };

  const generateFallbackSuggestions = (input: string, count: number = 3) => {
    const hexChars = "0123456789abcdef";

    const generateSingleSuggestion = () =>
      input
        .split("")
        .map((char) =>
          hexChars.includes(char.toLowerCase())
            ? char
            : hexChars[Math.floor(Math.random() * 16)]
        )
        .join("")
        .toLowerCase();

    return Array.from({ length: count }, generateSingleSuggestion);
  };

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const contractAddress = "0x745B31e60f5D8886CbeA44856e5C999a04595511";

  const purchaseSuffix = async () => {
    setIsProcessing(true);
    try {
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: ContractABI,
        functionName: "suffixPurchase",
        value: parseEther("0.01"), // Convert ETH to wei (e.g., 0.01 ETH)
        chain: sepolia,
        account: address as `0x${string}`,
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      try {
        const response = await fetch("http://localhost:3000/generate-wallet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            suffix: contractSuffix,
            // network: "sepolia",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setIsSuccess(true);
        const data = await response.json();
        console.log("Wallet generation successful:", data);
        setWalletAddress(data.address);
        setPrivateKey(data.privateKey);
        setTxnHash(tx);
      } catch (error) {
        console.error("Error generating wallet:", error);
        setIsError(true);
        setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      setIsError(true);
      setIsProcessing(false);
      setErrorMessage(error instanceof Error ? error.message : "Unknown error occurred");
    }
  };

  // Full state reset function
  const resetForm = () => {
    setContractSuffix("");
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage("");
    setTxnHash("");
    setWalletAddress("");
    setPrivateKey("");
  };

  return (
    <div className="">
      <section className="relative min-h-screen flex items-center justify-center py-20 bg-gradient-to-bl from-black via-black to-gray-500 rounded-b-[10px]">
        <div className="absolute top-5 right-5">
          <WalletConnect />
        </div>
        <div className="container px-4 ">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-white">
              {isSuccess ? "WALLET CREATED!" : "Create Your Personalized Wallet"}
            </h2>
            <p className=" text-gray-400 text-center mb-8 ">
              Create your wallet with a personalized hexadecimal suffix, making
              your wallet address unique and truly yours. Your identity, your
              brand, embedded in the blockchain.
            </p>

            <Card className="p-6 bg-gray-900/50 border border-gray-800 backdrop-blur-sm rounded-2xl shadow-xl">
              {isSuccess ? (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 flex flex-col items-center justify-center space-y-6"
                >
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-gray-300 to-white">
                    <CheckCircle2 className="h-12 w-12 text-gray-900" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                      Successfully Created!
                    </h3>
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-400">Wallet Address:</p>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(walletAddress);
                            }}
                            className="h-8 px-2 text-xs bg-gray-700 hover:bg-gray-600"
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="font-mono text-xs text-white break-all bg-gray-900/50 p-2 rounded">
                          {walletAddress}
                        </p>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm text-gray-400">Private Key:</p>
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(privateKey);
                            }}
                            className="h-8 px-2 text-xs bg-gray-700 hover:bg-gray-600"
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="font-mono text-xs text-white break-all bg-gray-900/50 p-2 rounded">
                          {privateKey}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() =>
                      window.open(
                        `https://sepolia.etherscan.io/address/${walletAddress}`,
                        "_blank"
                      )
                    }
                    className="mt-4 bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                  >
                    View on Etherscan
                  </Button>
                </motion.div>
              ) : isError ? (
                /* Error Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 flex flex-col items-center justify-center space-y-6"
                >
                  <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-red-400 to-red-600">
                    <XCircle className="h-12 w-12 text-white" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-red-400">
                      Transaction Failed!
                    </h3>
                    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-red-900/50">
                      <p className="text-sm text-red-400 mb-1">
                        Error Details:
                      </p>
                      <p className="font-mono text-xs text-red-300 break-all">
                        {errorMessage || "Unknown error occurred"}
                      </p>
                      {txnHash && (
                        <>
                          <p className="text-sm text-gray-400 mt-3 mb-1">
                            Transaction Hash:
                          </p>
                          <p className="font-mono text-xs text-gray-300 break-all">
                            {txnHash}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={resetForm}
                      className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900"
                    >
                      Try Again
                    </Button>
                    {txnHash && (
                      <Button
                        onClick={() =>
                          window.open(
                            `https://sepolia.etherscan.io/tx/${txnHash}`,
                            "_blank"
                          )
                        }
                        className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900"
                      >
                        View Failed Transaction
                      </Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <label
                      htmlFor="contractSuffix"
                      className="block text-sm font-medium text-gray-300 mb-1"
                    >
                      Wallet Address Suffix
                    </label>
                    <Input
                      id="contractSuffix"
                      value={contractSuffix}
                      onChange={(e) => handleSuffixChange(e.target.value)}
                      placeholder="e.g. 420DE2ED69"
                      className="bg-gray-800 border-gray-700 text-white w-full"
                    />

                    {contractSuffix && !isHexadecimal(contractSuffix) && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-gray-800 border border-gray-700 shadow-lg">
                        <div className="p-2 space-y-2">
                          <div className="flex items-center justify-between px-2 py-1 text-red-400">
                            <span className="font-mono">
                              {contractSuffix}
                            </span>
                            <span className="text-sm">Not available</span>
                          </div>

                          <div className="space-y-1">
                            {suggestion.map((suggestion, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-700/50 transition-colors"
                                onClick={() =>
                                  setContractSuffix(suggestion)
                                }
                              >
                                <span className="font-mono text-white">
                                  {suggestion}
                                </span>
                                <span className="ml-2 text-xs text-green-400">
                                  Available
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="mt-1 text-xs text-gray-400">
                      This will be appended to your wallet address for
                      easy identification
                    </p>
                  </div>

                  <Button
                    onClick={isConnected ? purchaseSuffix : undefined}
                    className="w-full bg-gray-600 hover:bg-gray-700"
                    disabled={
                      !contractSuffix ||
                      !isHexadecimal(contractSuffix) ||
                      isProcessing ||
                      !isConnected
                    }
                  >
                    {isConnected ? (
                      isProcessing ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Creating Wallet...
                        </div>
                      ) : (
                        <>
                          Create Wallet <Rocket className="ml-2 h-4 w-4" />
                        </>
                      )
                    ) : (
                      "Connect Wallet"
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Processing Screen */}
              {isProcessing && (
                <div className="py-10 flex flex-col items-center justify-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-700 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-white rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">
                      Processing Transaction
                    </h3>
                    <p className="text-gray-400">
                      Please wait while we create your wallet, this might take upto 2 minutes
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CreateWallet;
