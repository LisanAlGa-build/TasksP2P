import React, { useState } from 'react';
import { View, Modal, TextInput, Button, StyleSheet } from 'react-native';

const AddSubTaskModal = ({ visible, onClose, onAddSubTask }) => {
  const [subTaskTitle, setSubTaskTitle] = useState('');

  const handleAdd = () => {
    if (subTaskTitle.trim() === '') {
      return;
    }
    onAddSubTask(subTaskTitle);
    setSubTaskTitle('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.container}>
        <View style={styles.modal}>
          <TextInput
            style={styles.input}
            placeholder="Enter sub-task title"
            value={subTaskTitle}
            onChangeText={setSubTaskTitle}
          />
          <View style={styles.buttons}>
            <Button title="Cancel" onPress={onClose} />
            <Button title="Add" onPress={handleAdd} />
          </View>
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
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default AddSubTaskModal;
