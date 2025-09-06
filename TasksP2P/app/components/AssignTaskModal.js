import React from 'react';
import { View, Modal, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { USERS } from '../data/users';

const AssignTaskModal = ({ visible, onClose, onAssignTask }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => onAssignTask(item)}>
      <Text style={styles.user}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>Assign Task to:</Text>
          <FlatList
            data={USERS}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  user: {
    fontSize: 18,
    padding: 10,
  },
  closeButton: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AssignTaskModal;
