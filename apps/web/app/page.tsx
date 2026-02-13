"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Page() {
  const [partyId, setPartyId] = useState("");
  const [payload, setPayload] = useState("");
  const [txId, setTxId] = useState("");

  const [encryptedResult, setEncryptedResult] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* Encrypt & save */
  const handleEncrypt = async () => {
    try {
      setLoading(true);
      setError("");
      setEncryptedResult("");
      setDecryptedResult("");

      if (!partyId || !payload) {
        setError("Party ID and payload are required");
        return;
      }

      const parsedPayload = JSON.parse(payload);

      const res = await fetch(`${API_URL}/tx/encrypt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partyId, payload: parsedPayload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Encryption failed");

      setTxId(data.id);
      setEncryptedResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Fetch encrypted record */
  const handleFetch = async () => {
    try {
      setLoading(true);
      setError("");
      setEncryptedResult("");
      setDecryptedResult("");

      const res = await fetch(`${API_URL}/tx/${txId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fetch failed");

      setEncryptedResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* Decrypt record */
  const handleDecrypt = async () => {
    try {
      setLoading(true);
      setError("");
      setDecryptedResult("");

      const res = await fetch(`${API_URL}/tx/${txId}/decrypt`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Decryption failed");

      setDecryptedResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Secure Transaction
        </h1>

        {/* Party ID */}
        <div>
          <label className="text-sm text-gray-600">Party ID</label>
          <input
            type="text"
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            placeholder="party_123"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
          />
        </div>

        {/* Payload */}
        <div>
          <label className="text-sm text-gray-600">Payload (JSON)</label>
          <textarea
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none h-32 resize-none font-mono text-sm"
            placeholder='{"amount": 100, "currency": "USD"}'
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleEncrypt}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-3 rounded-lg transition font-medium"
          >
            {loading ? "Processing..." : "Encrypt & Save"}
          </button>

          <input
            type="text"
            placeholder="Transaction ID"
            value={txId}
            onChange={(e) => setTxId(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          <div className="flex gap-3">
            <button
              onClick={handleFetch}
              disabled={!txId || loading}
              className="flex-1 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white py-3 rounded-lg transition font-medium"
            >
              Fetch
            </button>
            <button
              onClick={handleDecrypt}
              disabled={!txId || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg transition font-medium"
            >
              Decrypt
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Encrypted Result */}
        {encryptedResult && (
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-1">
              Encrypted Record
            </h2>
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto text-xs">
              {encryptedResult}
            </pre>
          </div>
        )}

        {/* Decrypted Result */}
        {decryptedResult && (
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-1">
              Decrypted Payload
            </h2>
            <pre className="bg-gray-900 text-blue-400 p-3 rounded-lg overflow-auto text-xs">
              {decryptedResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
