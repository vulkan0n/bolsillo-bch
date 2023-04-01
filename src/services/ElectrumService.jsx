import {
  ElectrumClient,
  ElectrumCluster,
  ElectrumTransport,
} from "electrum-cash";

function ElectrumService() {
  async function connect() {
    // TODO: allow user to select electrum server(s)
    const electrum = new ElectrumClient(
      "Selene.cash",
      "1.4",
      "cashnode.bch.ninja",
      ElectrumTransport.WSS.Port,
      ElectrumTransport.WSS.Scheme
    );
    // TODO: what happens if connection fails?
    try {
      await electrum.connect();
      return electrum;
    } catch (e) {
      console.error(e);
    }
  }
}
