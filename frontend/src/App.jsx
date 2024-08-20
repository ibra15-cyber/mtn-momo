// src/App.js
import { useState } from "react";
import axios from "axios";

function App() {
  // State to manage form inputs
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [externalId, setExternalId] = useState("");
  const [partyIdType, setPartyIdType] = useState("");
  const [partyId, setPartyId] = useState("");
  const [payerMessage, setPayerMessage] = useState("");
  const [payeeNote, setPayeeNote] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
    try {
      const response = await axios.post("/api/mtn", {
        amount,
        currency,
        externalId,
        payer: {
          partyIdType,
          partyId,
        },
        payerMessage,
        payeeNote,
      });
      setResponse(response.data);
      setError(null);
    } catch (error) {
      setError(error.message);
      setResponse(null);
    }
  };

  return (
    <div className="App">
      <h1>MTN API Integration</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Amount:
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Currency:
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            External ID:
            <input
              type="text"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Payer Party ID Type:
            <input
              type="text"
              value={partyIdType}
              onChange={(e) => setPartyIdType(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Payer Party ID:
            <input
              type="text"
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Payer Message:
            <input
              type="text"
              value={payerMessage}
              onChange={(e) => setPayerMessage(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Payee Note:
            <input
              type="text"
              value={payeeNote}
              onChange={(e) => setPayeeNote(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Make API Calls</button>
      </form>
      {response && (
        <div>
          <h2>Response</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      {error && (
        <div>
          <h2>Error</h2>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
