import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0xbFB014898E5f55d98136fCD3dB7964231113e5aF';

import {abi as CONTRACT_ABI} from "../../components/abi"

interface CertMetadata {
  name: string;
  description: string;
  image: string;
}

interface Certificate {
  tokenId: string;
  tokenURI: string;
  owner: string;
  blockNumber: number;
  transactionHash: string;
  metadata: CertMetadata | null;
  imageUrl: string | null;
}

interface Issuer {
  account_address: string;
  name: string;
  issuer_address: string;
  issuer_uid_govt: string;
}

const ListCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [issuerUid, setIssuerUid] = useState('0');
  const [issuerInfo, setIssuerInfo] = useState<Issuer | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [fromBlock, setFromBlock] = useState('');
  const [toBlock, setToBlock] = useState('');
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  useEffect(() => {
    // Use Alchemy provider for Sepolia
    const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_API || 'your-alchemy-key';
    const rpcProvider = new ethers.JsonRpcProvider(
      `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`
    );
    setProvider(rpcProvider);
  }, []);

  const convertIpfsToHttp = (ipfsUrl: string): string => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  const fetchMetadata = async (tokenURI: string): Promise<{ metadata: CertMetadata | null; imageUrl: string | null }> => {
    try {
      const httpUrl = convertIpfsToHttp(tokenURI);
      const response = await fetch(httpUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }
      
      const metadata: CertMetadata = await response.json();
      const imageUrl = metadata.image ? convertIpfsToHttp(metadata.image) : null;
      
      return { metadata, imageUrl };
    } catch (err) {
      console.error('Error fetching metadata:', err);
      return { metadata: null, imageUrl: null };
    }
  };

  const fetchIssuerInfo = async (uid: string) => {
    if (!provider) return;
    
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const issuer = await contract.IssuerMapping(uid);
      
      if (issuer[1] === '') {
        setError('Issuer not found');
        setIssuerInfo(null);
        return;
      }
      
      setIssuerInfo({
        account_address: issuer[0],
        name: issuer[1],
        issuer_address: issuer[2],
        issuer_uid_govt: issuer[3].toString(),
      });
      
      return issuer[0];
    } catch (err) {
      console.error('Error fetching issuer:', err);
      setError('Error fetching issuer information');
      return null;
    }
  };

  const fetchCertificates = async () => {
    if (!provider) {
      setError('Provider not initialized');
      return;
    }

    setLoading(true);
    setError('');
    setCertificates([]);
    setProgress(null);

    try {
      const issuerAddress = await fetchIssuerInfo(issuerUid);
      if (!issuerAddress) {
        setLoading(false);
        return;
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // Determine block range to search
      const currentBlock = await provider.getBlockNumber();
      const startBlock = fromBlock ? parseInt(fromBlock) : Math.max(0, currentBlock - 1000); // Default to last 1000 blocks
      const endBlock = toBlock ? parseInt(toBlock) : currentBlock;
      
      if (startBlock > endBlock) {
        setError('From block cannot be greater than to block');
        setLoading(false);
        return;
      }

      const CHUNK_SIZE = 10; // Alchemy free tier allows max 10 blocks per request
      
      let allEvents: any[] = [];
      const totalChunks = Math.ceil((endBlock - startBlock + 1) / CHUNK_SIZE);
      let currentChunk = 0;
      
      // Fetch events in chunks to comply with Alchemy free tier limits
      const filter = contract.filters.certMinted();
      
      for (let fromBlockNum = startBlock; fromBlockNum <= endBlock; fromBlockNum += CHUNK_SIZE) {
        const toBlockNum = Math.min(fromBlockNum + CHUNK_SIZE - 1, endBlock);
        currentChunk++;
        setProgress({ current: currentChunk, total: totalChunks });
        
        try {
          const events = await contract.queryFilter(filter, fromBlockNum, toBlockNum);
          allEvents = allEvents.concat(events);
          
          // Add a small delay to avoid hitting rate limits
          if (fromBlockNum + CHUNK_SIZE <= endBlock) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (chunkError: any) {
          console.error(`Error fetching blocks ${fromBlockNum}-${toBlockNum}:`, chunkError);
          // For rate limit errors, try with smaller chunks
          if (chunkError?.message && chunkError.message.includes('block range')) {
            console.log('Attempting with single block...');
            try {
              const singleBlockEvents = await contract.queryFilter(filter, fromBlockNum, fromBlockNum);
              allEvents = allEvents.concat(singleBlockEvents);
            } catch (singleBlockError) {
              console.error(`Failed to fetch single block ${fromBlockNum}:`, singleBlockError);
            }
          }
        }
      }
      
      const events = allEvents;

      const certPromises = events.map(async (event) => {
        try {
          const tokenId = event.args?._tokenUid.toString();
          
          const tx = await provider.getTransaction(event.transactionHash);
          
          if (tx && tx.from.toLowerCase() === issuerAddress.toLowerCase()) {
            const [tokenURI, owner] = await Promise.all([
              contract.tokenURI(tokenId),
              contract.ownerOf(tokenId),
            ]);

            // Fetch metadata from IPFS
            const { metadata, imageUrl } = await fetchMetadata(tokenURI);

            return {
              tokenId,
              tokenURI,
              owner,
              blockNumber: event.blockNumber,
              transactionHash: event.transactionHash,
              metadata,
              imageUrl,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching cert ${event.args?._tokenUid}:`, err);
          return null;
        }
      });

      const results = await Promise.all(certPromises);
      const validCerts = results.filter((cert): cert is Certificate => cert !== null);
      
      validCerts.sort((a, b) => b.blockNumber - a.blockNumber);
      
      setCertificates(validCerts);
      
      if (validCerts.length === 0) {
        setError('No certificates found for this issuer');
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Error fetching certificates. Please try again.');
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Issued Certificates</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuer UID
              </label>
              <input
                type="number"
                min="0"
                value={issuerUid}
                onChange={(e) => setIssuerUid(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter issuer UID (e.g., 0, 1, 2...)"
              />
            </div>
            <button
              onClick={fetchCertificates}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Loading...' : 'Fetch Certificates'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Block (optional)
              </label>
              <input
                type="number"
                min="0"
                value={fromBlock}
                onChange={(e) => setFromBlock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty for recent blocks"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Block (optional)
              </label>
              <input
                type="number"
                min="0"
                value={toBlock}
                onChange={(e) => setToBlock(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave empty for latest block"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
            <p><strong>Note:</strong> Due to Alchemy free tier limits, searches are restricted to 10 blocks at a time. 
            For better performance, specify a smaller block range. If no range is specified, it will search the last 1000 blocks.</p>
          </div>
        </div>

        {issuerInfo && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Issuer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Name:</span> {issuerInfo.name}
              </div>
              <div>
                <span className="font-medium">Address:</span> {shortenAddress(issuerInfo.account_address)}
              </div>
              <div className="md:col-span-2">
                <span className="font-medium">Physical Address:</span> {issuerInfo.issuer_address}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading certificates and metadata...</p>
          {progress && (
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing blocks...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      ) : certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.tokenId}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {cert.imageUrl && (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={cert.imageUrl}
                    alt={cert.metadata?.name || 'Certificate'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                <h3 className="text-white font-bold text-lg">
                  {cert.metadata?.name || `Certificate #${cert.tokenId}`}
                </h3>
              </div>
              
              <div className="p-4 space-y-3">
                {cert.metadata?.description && (
                  <div>
                    <p className="text-sm text-gray-700 italic">
                      &quot;{cert.metadata.description}&quot;
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Token ID
                  </p>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">
                    #{cert.tokenId}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Owner
                  </p>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all">
                    {shortenAddress(cert.owner)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">
                    Transaction
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${cert.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {shortenAddress(cert.transactionHash)} ↗
                  </a>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Block #{cert.blockNumber}
                  </span>
                  {cert.metadata && (
                    <a
                      href={convertIpfsToHttp(cert.tokenURI)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      View Metadata ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !error && (
        <div className="text-center pb-12 text-gray-200">
          <p className="text-lg">Enter an issuer UID and click &quot;Fetch Certificates&quot; to view issued certificates</p>
        </div>
      )}
    </div>
  );
};

export default ListCertificates;