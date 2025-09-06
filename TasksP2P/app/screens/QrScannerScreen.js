import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import P2pService from '../services/P2pService';

const QrScannerScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);

  const onSuccess = (e) => {
    const collectionId = e.data;
    Alert.alert('QR Code Scanned', `Attempting to join collection: ${collectionId}`, [
      { text: 'OK', onPress: () => setScanning(false) }
    ]);
    console.log('QR Code Data:', collectionId);
    P2pService.joinCollection(collectionId);
    navigation.goBack(); // Go back after scanning
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code to Join</Text>
      {scanning ? (
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
          topContent={
            <Text style={styles.centerText}>
              Point your camera at the QR code.
            </Text>
          }
          bottomContent={
            <Button title="Cancel" onPress={() => setScanning(false)} />
          }
        />
      ) : (
        <Button title="Start Scanning" onPress={() => setScanning(true)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});

export default QrScannerScreen;
