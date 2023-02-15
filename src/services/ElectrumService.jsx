import { ElectrumClient, ElectrumCluster, ElectrumTransport } from "electrum-cash";


// Make sure to connect via Websocket as browsers don't have regular sockets :)
const electrum = new ElectrumClient("Selene.cash", "1.4", "cashnode.bch.ninja", ElectrumTransport.WSS.Port, ElectrumTransport.WSS.Scheme);
await electrum.connect();

function ElectrumService() {


}

export default ElectrumService;
