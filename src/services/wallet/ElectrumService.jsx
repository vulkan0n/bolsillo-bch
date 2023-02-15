import { ElectrumClient } from "electrum-cash";

function ElectrumService() {
  const electrum = new ElectrumClient(
    "Selene.cash",
    "1.4",
    "cashnode.bch.ninja"
  );

  const isConnected = false;

  async function connect() {
    try {
      await electrum.connect();
      isConnected = true;
    } catch (e) {
      isConnected = false;
      console.error(e);
    }
  }
}

function useElectrumStatus() {
  const [isConnected, setIsConnected] = useState(false);

}

export default ElectrumService;
