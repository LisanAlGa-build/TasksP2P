import * as NearbyConnections from 'expo-nearby-connections';

const SERVICE_ID = 'com.donedeal';

class P2pService {
  constructor() {
    this.peerId = null;
    this.connectedPeers = new Map();
    this.onTextReceived = (callback) => {};
  }

  async start() {
    try {
      this.peerId = await NearbyConnections.startAdvertise(
        'DoneDeal',
        NearbyConnections.Strategy.P2P_STAR
      );
      console.log('Started advertising with peerId:', this.peerId);

      this.onInvitationSubscription = NearbyConnections.onInvitationReceived(
        this.handleInvitation
      );
      this.onConnectedSubscription = NearbyConnections.onConnected(
        this.handleConnected
      );
      this.onDisconnectedSubscription = NearbyConnections.onDisconnected(
        this.handleDisconnected
      );
      this.onTextReceivedSubscription = NearbyConnections.onTextReceived(
        this.handleTextReceived
      );

      await this.startDiscovery();
    } catch (error) {
      console.error('Error starting P2P service:', error);
    }
  }

  async stop() {
    try {
      await NearbyConnections.stopAdvertise();
      await NearbyConnections.stopDiscovery();
      this.onInvitationSubscription.remove();
      this.onConnectedSubscription.remove();
      this.onDisconnectedSubscription.remove();
      this.onTextReceivedSubscription.remove();
      this.connectedPeers.forEach((peer, peerId) => {
        this.disconnect(peerId);
      });
      this.connectedPeers.clear();
      console.log('Stopped P2P service');
    } catch (error) {
      console.error('Error stopping P2P service:', error);
    }
  }

  async startDiscovery() {
    try {
      await NearbyConnections.startDiscovery(
        'DoneDeal',
        NearbyConnections.Strategy.P2P_STAR
      );
      console.log('Started discovery');

      this.onPeerFoundSubscription = NearbyConnections.onPeerFound(
        this.handlePeerFound
      );
      this.onPeerLostSubscription = NearbyConnections.onPeerLost(
        this.handlePeerLost
      );
    } catch (error) {
      console.error('Error starting discovery:', error);
    }
  }

  handleInvitation = ({ peerId, name }) => {
    console.log(`Received invitation from ${name} (${peerId})`);
    NearbyConnections.acceptConnection(peerId);
  };

  handleConnected = ({ peerId, name }) => {
    console.log(`Connected to ${name} (${peerId})`);
    this.connectedPeers.set(peerId, { name });
  };

  handleDisconnected = ({ peerId }) => {
    console.log(`Disconnected from ${peerId}`);
    this.connectedPeers.delete(peerId);
  };

  handlePeerFound = ({ peerId, name }) => {
    console.log(`Found peer ${name} (${peerId})`);
    if (!this.connectedPeers.has(peerId)) {
      NearbyConnections.requestConnection(peerId);
    }
  };

  handlePeerLost = ({ peerId }) => {
    console.log(`Lost peer ${peerId}`);
  };

  handleTextReceived = ({ peerId, text }) => {
    console.log(`Received text from ${peerId}: ${text}`);
    this.onTextReceived({ peerId, text });
  };

  sendToAll(text) {
    this.connectedPeers.forEach((peer, peerId) => {
      NearbyConnections.sendText(peerId, text);
    });
  }

  disconnect(peerId) {
    NearbyConnections.disconnect(peerId);
  }
}

export default new P2pService();
