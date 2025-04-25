import { ElectrumClient, ElectrumClientEvents, RPCNotification as ElectrumRPCNotification } from "@electrum-cash/network";
import { ElectrumWebSocket } from "@electrum-cash/web-socket";

export type ServerInfo = {
  host: string;
  port: number;
  encrypted: boolean;
};

export default class ElectrumClientManager extends EventTarget {
  name: string;
  protocolVersion: string;
  serversInfo: ServerInfo[];
  client: ElectrumClient<ElectrumClientEvents> | null;
  clientInitializing: boolean;
  clientSuccessfulLastConnectAttempt: boolean;
  constructor (name: string, protocolVersion: string, serversInfo: ServerInfo[]) {
    super()
    this.name = name;
    this.protocolVersion = protocolVersion;
    this.serversInfo = serversInfo;
    this.client = null;
    this.clientInitializing = false;
    this.clientSuccessfulLastConnectAttempt = false;
  }
  isConnected (): boolean {
    return !!this.client;
  }
  getClient (): ElectrumClient<ElectrumClientEvents> | null {
    return this.client;
  }
  async init () {
    const onClientConnected = async () => {
      try {
        this.dispatchEvent(new Event("connected"));
      } catch (err) {
        this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: `error thrown on connected event`, error: err } }));
      }
    };
    const onClientDisconnected = async () => {
      try {
        this.dispatchEvent(new Event("disconnected"));
      } catch (err) {
        this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: `error thrown on disconnected event`, error: err } }));
      }
    };
    const onClientNotification = (message: ElectrumRPCNotification): void => {
      try {
        this.dispatchEvent(new MessageEvent("notification", { data: message }));
      } catch (err) {
        this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: `error thrown on notification event`, error: err } }));
      }
    };
    const initClient = async () => {
      if (this.clientInitializing) {
        return;
      }
      const onReconnect = () => {
        if (this.clientSuccessfulLastConnectAttempt) {
          this.clientSuccessfulLastConnectAttempt = false;
          this.dispatchEvent(new MessageEvent("console", { data: { type: "log", message: `Reconnect ${this.name} node immediately.` } }));
          initClient();
        } else {
          const RECONNECT_DELAY = 30;
          this.dispatchEvent(new MessageEvent("console", { data: { type: "log", message: `Will try to connect ${this.name} node in: ${RECONNECT_DELAY} seconds` } }));
          setTimeout(() => {
            initClient();
          }, RECONNECT_DELAY * 1000);
        }
      };
      const cleanup = () => {
        if (this.client != null) {
			    this.client.removeListener("disconnected", onDisconnected);
          this.client = null;
        }
      };
      const onDisconnected = () => {
        cleanup();
        onClientDisconnected();
        this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: `Disconnected from ${this.name} node.` } }));
        onReconnect();
      };
      try {
        const { host, port, encrypted } = this.serversInfo[Math.floor(Math.random() * this.serversInfo.length)] as ServerInfo;
        this.dispatchEvent(new MessageEvent("console", { data: { type: "info", message: `Connecting to a ${this.name} node, address: ${host}:${port}` } }));
        this.clientInitializing = true;
        const client = new ElectrumClient("Selene.cash", this.protocolVersion, new ElectrumWebSocket(host, port, encrypted));
        await client.connect();
        this.dispatchEvent(new MessageEvent("console", { data: { type: "info", message: `Connected to ${this.name} node, address: ${host}:${port}` } }));
        this.client = client;
        (this as any)._onClientNotification = onClientNotification;
        (this as any)._onDisconnected = onDisconnected;
        this.client.addListener("notification", onClientNotification);
			  this.client.addListener("disconnected", onDisconnected);
        this.clientSuccessfulLastConnectAttempt = true;
        onClientConnected();
      } catch (err) {
        this.dispatchEvent(new MessageEvent("connect-error", { data: err }));
        this.dispatchEvent(new MessageEvent("console", { data: { type: "warn", message: `An attempt to connect to ${this.name} node failed`, error: err } }));
        onReconnect();
      } finally {
        this.clientInitializing = false;
      }
    };
    return await initClient();
  }
  async destroy () {
    if (this.client != null) {
      this.client.removeListener("notification", (this as any)._onClientNotification);
			this.client.removeListener("disconnected", (this as any)._onDisconnected);
      await this.client.disconnect(true, false);
      this.client = null;
    }
  }
}
