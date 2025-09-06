import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import P2pService from '../services/P2pService';

const QrCodeDisplayScreen = ({ navigation }) => {
  const collectionId = P2pService.getCollectionId();

  if (!collectionId) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Collection ID Available</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan this QR Code to Join</Text>
      <View style={styles.qrCodeContainer}>
        <QRCode
          value={collectionId}
          size={200}
          color="black"
          backgroundColor="white"
        />
      </View>
      <Text style={styles.collectionIdText}>Collection ID: {collectionId}</Text>
      <Button title="Done" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  qrCodeContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  collectionIdText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default QrCodeDisplayScreen;
