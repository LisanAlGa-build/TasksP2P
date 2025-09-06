import 'react-native-get-random-values'; // Required for UUID generation
import * as Crypto from 'expo-crypto';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from 'react-native-webrtc';

const SIGNALING_SERVER_URL = 'ws://localhost:8080'; // Placeholder for your signaling server URL

const PEER_CONNECTION_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

class P2pService {
  constructor() {
    this.collectionId = null; // Unique ID for the task collection
    this.peerId = Crypto.randomUUID(); // Generate a unique ID for this peer
    this.connectedPeers = new Map(); // Map of peerId -> { peerConnection, dataChannel }
    this.onTextReceived = (callback) => {};
    this.ws = null; // WebSocket connection to signaling server
  }

  createPeerConnection = (peerId) => {
    const peerConnection = new RTCPeerConnection(PEER_CONNECTION_CONFIG);

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to signaling server:', event.candidate);
        this.ws.send(JSON.stringify({
          type: 'candidate',
          candidate: event.candidate,
          senderId: this.peerId,
          receiverId: peerId,
        }));
      }
    };

    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state changed:', peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
        this.handleDisconnected({ peerId });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed:', peerConnection.connectionState);
    };

    peerConnection.ondatachannel = (event) => {
      console.log('Data channel received:', event.channel.label);
      const dataChannel = event.channel;
      dataChannel.onmessage = (e) => this.handleTextReceived({ peerId, text: e.data });
      dataChannel.onopen = () => console.log('Data channel opened with peer:', peerId);
      dataChannel.onclose = () => console.log('Data channel closed with peer:', peerId);
      this.connectedPeers.set(peerId, { peerConnection, dataChannel });
    };

    return peerConnection;
  };

  generateCollectionId() {
    this.collectionId = uuidv4();
    return this.collectionId;
  }

  joinCollection = (collectionId) => {
    this.collectionId = collectionId;
    console.log(`Attempting to join collection: ${collectionId}`);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'join',
        collectionId: collectionId,
        senderId: this.peerId,
      }));
    } else {
      console.warn('WebSocket not open. Cannot send join message.');
      // Potentially queue the join request or retry when WS is open
    }
  };

  getCollectionId() {
    return this.collectionId;
  }

  createOffer = async (receiverId) => {
    const peerConnection = this.createPeerConnection(receiverId);
    const dataChannel = peerConnection.createDataChannel('dataChannel');
    dataChannel.onmessage = (e) => this.handleTextReceived({ peerId: receiverId, text: e.data });
    dataChannel.onopen = () => console.log('Data channel opened with peer:', receiverId);
    dataChannel.onclose = () => console.log('Data channel closed with peer:', receiverId);

    this.connectedPeers.set(receiverId, { peerConnection, dataChannel });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    console.log('Sending offer to signaling server:', offer);
    this.ws.send(JSON.stringify({
      type: 'offer',
      offer: offer,
      senderId: this.peerId,
      receiverId: receiverId,
      collectionId: this.collectionId,
    }));
  };

  handleOffer = async (senderId, offer) => {
    let peerConnection = this.connectedPeers.get(senderId)?.peerConnection;
    if (!peerConnection) {
      peerConnection = this.createPeerConnection(senderId);
      this.connectedPeers.set(senderId, { peerConnection });
    }

    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    console.log('Sending answer to signaling server:', answer);
    this.ws.send(JSON.stringify({
      type: 'answer',
      answer: answer,
      senderId: this.peerId,
      receiverId: senderId,
    }));
  };

  handleAnswer = async (senderId, answer) => {
    const peer = this.connectedPeers.get(senderId);
    if (peer && peer.peerConnection) {
      await peer.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  handleCandidate = async (senderId, candidate) => {
    const peer = this.connectedPeers.get(senderId);
    if (peer && peer.peerConnection) {
      await peer.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  handleDisconnected = ({ peerId }) => {
    console.log(`Disconnected from ${peerId}`);
    const peer = this.connectedPeers.get(peerId);
    if (peer && peer.peerConnection) {
      peer.peerConnection.close();
    }
    this.connectedPeers.delete(peerId);
  };

  async start() {
    console.log('P2pService started. Peer ID:', this.peerId);
    registerGlobals();

    this.ws = new WebSocket(SIGNALING_SERVER_URL);

    this.ws.onopen = () => {
      console.log('Connected to signaling server');
      // Send peerId to signaling server
      this.ws.send(JSON.stringify({ type: 'register', peerId: this.peerId }));
    };

    this.ws.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      console.log('Received message from signaling server:', message);

      switch (message.type) {
        case 'offer':
          await this.handleOffer(message.senderId, message.offer);
          break;
        case 'answer':
          await this.handleAnswer(message.senderId, message.answer);
          break;
        case 'candidate':
          await this.handleCandidate(message.senderId, message.candidate);
          break;
        case 'join':
          // A new peer wants to join the collection, create an offer
          if (message.collectionId === this.collectionId && message.senderId !== this.peerId) {
            this.createOffer(message.senderId);
          }
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    };

    this.ws.onclose = () => {
      console.log('Disconnected from signaling server');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  async stop() {
    console.log('P2pService stopped.');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectedPeers.forEach(({ peerConnection, dataChannel }) => {
      if (dataChannel) dataChannel.close();
      if (peerConnection) peerConnection.close();
    });
    this.connectedPeers.clear();
    this.collectionId = null;
  }

  sendToAll(text) {
    this.connectedPeers.forEach(({ dataChannel }, peerId) => {
      if (dataChannel && dataChannel.readyState === 'open') {
        console.log(`Sending text to peer ${peerId}:`, text);
        dataChannel.send(text);
      } else {
        console.warn(`Data channel to peer ${peerId} is not open. Cannot send text.`);
      }
    });
  }

  disconnect(peerId) {
    const peer = this.connectedPeers.get(peerId);
    if (peer) {
      if (peer.dataChannel) peer.dataChannel.close();
      if (peer.peerConnection) peer.peerConnection.close();
      this.connectedPeers.delete(peerId);
      console.log(`Disconnected from peer: ${peerId}`);
    }
  }
}

export default new P2pService();
