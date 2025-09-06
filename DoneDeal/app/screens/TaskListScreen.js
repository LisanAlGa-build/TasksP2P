import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from '../models/Task';
import TaskItem from '../components/TaskItem';
import P2pService from '../services/P2pService';

const TASKS_KEY = 'tasks';

const TaskListScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    loadTasks();
    P2pService.start();

    P2pService.onTextReceived = ({ text }) => {
      const receivedTasks = JSON.parse(text);
      setTasks(receivedTasks);
    };

    return () => {
      P2pService.stop();
    };
  }, []);

  useEffect(() => {
    saveTasks();
    if (tasks.length > 0) {
      P2pService.sendToAll(JSON.stringify(tasks));
    }
  }, [tasks]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_KEY);
      if (storedTasks !== null) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const saveTasks = async () => {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  const findAndUpdateTask = (tasks, taskId, update) => {
    return tasks.map((task) => {
      if (task.id === taskId) {
        return update(task);
      }
      if (task.subTasks.length > 0) {
        return { ...task, subTasks: findAndUpdateTask(task.subTasks, taskId, update) };
      }
      return task;
    });
  };

  const handleToggleComplete = (taskId) => {
    const newTasks = findAndUpdateTask(tasks, taskId, (task) => ({
      ...task,
      completed: !task.completed,
    }));
    setTasks(newTasks);
  };

  const handleToggleStar = (taskId) => {
    const newTasks = findAndUpdateTask(tasks, taskId, (task) => ({
      ...task,
      starred: !task.starred,
    }));
    setTasks(newTasks);
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '') {
      return;
    }
    const newTask = new Task(
      Date.now().toString(),
      newTaskTitle,
      ''
    );
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleAddSubTask = (taskId, subTaskTitle) => {
    const newTasks = findAndUpdateTask(tasks, taskId, (task) => ({
      ...task,
      subTasks: [
        ...task.subTasks,
        new Task(Date.now().toString(), subTaskTitle, ''),
      ],
    }));
    setTasks(newTasks);
  };

  const handleSchedule = (taskId, date) => {
    const newTasks = findAndUpdateTask(tasks, taskId, (task) => ({
      ...task,
      dueDate: date.toISOString(),
    }));
    setTasks(newTasks);
  };

  const handleAssign = (taskId, user) => {
    const newTasks = findAndUpdateTask(tasks, taskId, (task) => ({
      ...task,
      assignedTo: user,
    }));
    setTasks(newTasks);
  };

  const flattenTasks = (tasks, level = 0) => {
    let flatTasks = [];
    tasks.forEach((task) => {
      flatTasks.push({ ...task, level });
      if (task.subTasks.length > 0) {
        flatTasks = flatTasks.concat(flattenTasks(task.subTasks, level + 1));
      }
    });
    return flatTasks;
  };

  const renderItem = ({ item }) => (
    <TaskItem
      task={item}
      onToggleComplete={handleToggleComplete}
      onToggleStar={handleToggleStar}
      onAddSubTask={handleAddSubTask}
      onSchedule={handleSchedule}
      onAssign={handleAssign}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new task"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
        />
        <Button title="Add" onPress={handleAddTask} />
      </View>
      <FlatList
        data={flattenTasks(tasks)}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default TaskListScreen;
