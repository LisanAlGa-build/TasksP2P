import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AddSubTaskModal from './AddSubTaskModal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AssignTaskModal from './AssignTaskModal';

const TaskItem = ({ task, onToggleComplete, onToggleStar, onAddSubTask, onSchedule, onAssign }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isAssignModalVisible, setAssignModalVisibility] = useState(false);

  const handleAddSubTask = (subTaskTitle) => {
    onAddSubTask(task.id, subTaskTitle);
    setModalVisible(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    onSchedule(task.id, date);
    hideDatePicker();
  };

  const handleAssign = (user) => {
    onAssign(task.id, user);
    setAssignModalVisibility(false);
  };

  return (
    <View style={{ marginLeft: task.level * 20 }}>
      <TouchableOpacity onPress={() => onToggleComplete(task.id)}>
        <View style={styles.itemContainer}>
          <View style={styles.taskContainer}>
            <Text style={task.completed ? styles.completedTask : styles.task}>{task.title}</Text>
            {task.dueDate && (
              <Text style={styles.dueDate}>
                Due: {new Date(task.dueDate).toLocaleString()}
              </Text>
            )}
            {task.assignedTo && (
              <Text style={styles.assignedTo}>
                Assigned to: {task.assignedTo.name}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={() => onToggleStar(task.id)}>
            <Ionicons
              name={task.starred ? 'star' : 'star-outline'}
              size={24}
              color={task.starred ? '#f1c40f' : '#ccc'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <View style={styles.buttonsContainer}>
        <Button title="Add Sub-task" onPress={() => setModalVisible(true)} />
        <Button title="Schedule" onPress={showDatePicker} />
        <Button title="Assign" onPress={() => setAssignModalVisibility(true)} />
      </View>
      <AddSubTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddSubTask={handleAddSubTask}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <AssignTaskModal
        visible={isAssignModalVisible}
        onClose={() => setAssignModalVisibility(false)}
        onAssignTask={handleAssign}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskContainer: {
    flex: 1,
  },
  task: {
    fontSize: 18,
  },
  completedTask: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    color: '#ccc',
  },
  dueDate: {
    fontSize: 12,
    color: '#888',
  },
  assignedTo: {
    fontSize: 12,
    color: '#888',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
});

export default TaskItem;
