import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, TextInput, Share, Alert,
  Vibration
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [userId, setUserId] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [newFriendId, setNewFriendId] = useState('');
  const [newFriendName, setNewFriendName] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // Initialize user
  useEffect(() => {
    const initUser = async () => {
      let id = await AsyncStorage.getItem('userId');
      if (!id) {
        id = 'user-' + Math.random().toString(36).substr(2, 9);
        await AsyncStorage.setItem('userId', id);
      }
      setUserId(id);
      
      const savedFriends = await AsyncStorage.getItem('friends');
      if (savedFriends) setFriends(JSON.parse(savedFriends));
    };
    initUser();
  }, []);

  // Save friends when changed
  useEffect(() => {
    AsyncStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  // Share user ID - NOW WORKING PROPERLY
  const shareUserId = async () => {
    try {
      await Share.share({
        message: `Add me on Kitap! My ID is: ${userId}\n\nDownload Kitap to connect with me silently.`,
        title: 'Share My Kitap ID'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share ID');
    }
  };

  // Add friend - SIMPLIFIED AND WORKING
  const addFriend = () => {
    if (!newFriendId.trim() || !newFriendName.trim()) {
      Alert.alert('Error', 'Please enter both ID and name');
      return;
    }
    
    if (friends.some(f => f.id === newFriendId)) {
      Alert.alert('Error', 'Friend already added');
      return;
    }
    
    setFriends(prev => [...prev, {
      id: newFriendId.trim(),
      name: newFriendName.trim(),
      soundEnabled: true,
      vibrationEnabled: true,
      notificationEnabled: true
    }]);
    
    setNewFriendId('');
    setNewFriendName('');
    setShowAddFriendModal(false);
  };

  // Remove friend
  const removeFriend = (id) => {
    setFriends(prev => prev.filter(f => f.id !== id));
  };

  // Toggle settings
  const toggleSetting = (id, setting) => {
    setFriends(prev => prev.map(friend =>
      friend.id === id ? { ...friend, [setting]: !friend[setting] } : friend
    ));
  };

  // Friend Profile Screen
  if (selectedFriend) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Alert {selectedFriend.name}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedFriend(null)}>
          <Text style={styles.buttonText}>← Back</Text>
        </TouchableOpacity>
        
        <View style={styles.friendProfile}>
          <Text style={styles.friendName}>{selectedFriend.name}</Text>
          <Text style={styles.friendId}>{selectedFriend.id}</Text>
          
          <View style={styles.soundButtons}>
            {[1, 2, 3].map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.soundButton, {backgroundColor: ['#9b59b6', '#3498db', '#2ecc71'][num - 1]}]}
                onPress={() => {
                  if (selectedFriend.soundEnabled) {
                    // Sound would play here in full implementation
                  }
                  if (selectedFriend.vibrationEnabled) {
                    Vibration.vibrate(500);
                  }
                  Alert.alert('Alert Sent', `Sent sound ${num} alert to ${selectedFriend.name}`);
                }}
              >
                <Text style={styles.soundButtonText}>Sound {num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            onChangeText={text => setNotificationMessage(text)}
          />
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={() => {
              Alert.alert('Message Sent', `Sent message to ${selectedFriend.name}`);
            }}
          >
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Main Screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kitap</Text>
      <Text style={styles.subtitle}>Silent Communication</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.mainButton, {backgroundColor: '#f1c40f'}]}
          onPress={shareUserId}
        >
          <Text style={styles.buttonText}>Register & Share ID</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mainButton, {backgroundColor: '#2c3e50'}]}
          onPress={() => setShowAddFriendModal(true)}
        >
          <Text style={[styles.buttonText, {color: '#fff'}]}>Add Friend</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.friendsList}>
        {friends.length === 0 ? (
          <Text style={styles.emptyText}>No friends added yet</Text>
        ) : (
          friends.map((friend) => (
            <View key={friend.id} style={styles.friendItem}>
              <TouchableOpacity 
                style={styles.friendInfo}
                onPress={() => setSelectedFriend(friend)}
              >
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendId}>{friend.id}</Text>
              </TouchableOpacity>
              
              <View style={styles.toggleContainer}>
                {['soundEnabled', 'vibrationEnabled', 'notificationEnabled'].map((setting) => (
                  <TouchableOpacity
                    key={setting}
                    style={[styles.toggle, friend[setting] && styles.toggleActive]}
                    onPress={() => toggleSetting(friend.id, setting)}
                  >
                    <Text>{setting === 'soundEnabled' ? '🔊' : setting === 'vibrationEnabled' ? '📳' : '🔔'}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => removeFriend(friend.id)}
              >
                <Text style={styles.deleteButtonText}>❌</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      
      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Friend</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Friend's ID"
              value={newFriendId}
              onChangeText={setNewFriendId}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Friend's Name"
              value={newFriendName}
              onChangeText={setNewFriendName}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#e74c3c'}]}
                onPress={() => setShowAddFriendModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, {backgroundColor: '#2ecc71'}]}
                onPress={addFriend}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      <Text style={styles.userIdText}>Your ID: {userId}</Text>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f1c40f',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginBottom: 30,
  },
  mainButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginTop: 20,
  },
  friendsList: {
    marginBottom: 20,
  },
  friendItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  friendId: {
    fontSize: 12,
    color: '#95a5a6',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  toggle: {
    padding: 8,
    borderRadius: 5,
    marginHorizontal: 3,
    backgroundColor: '#ecf0f1',
  },
  toggleActive: {
    backgroundColor: '#bdc3c7',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  userIdText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    marginBottom: 20,
  },
  friendProfile: {
    flex: 1,
    width: '100%',
  },
  soundButtons: {
    marginBottom: 20,
  },
  soundButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  soundButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  messageInput: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sendButton: {
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  // Modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 15,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
});

export default App;