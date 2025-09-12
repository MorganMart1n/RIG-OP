import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TextInput } from 'react-native';
import { Button, Avatar, Divider, Layout } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { API_URL } from '@env';

function ProfileScreen() {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [phonenumber, setPhoneNumber] = useState(null);
  const [dob, setDOB] = useState(null);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: 'POST',
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUserData(data.user);
          setUsername(data.user.username);
          setEmail(data.user.email);
          setPhoneNumber(data.user.phonenumber);
          setDOB(data.user.dob);

          console.log(userData)
        } else {
          Alert.alert('Error', data.message || 'Failed to fetch user information');
        }
      } catch (error) {
        Alert.alert('Error', 'Something went wrong');
      }
    }

    fetchUserData();
  }, []);

  async function logout() {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('Success', data.message);
        navigation.replace('Login');
      } else {
        Alert.alert('Error', data.message || 'Logout failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    }
  }
//Need to check in which submit it achieved
//fill updated user info 
//check changes based on previously imported user profile
//send to backend
//update changes
if(isEditing){
  console.log("waaa")
  const UpdatedUser = {
    username: username,
    email: email,
    phonenumber: phonenumber,
    dob:dob,
    role:userData.role,
    password:userData.password,
    id:userData.id
  }
}

  



 
  return (
    <Layout style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}></View>
          <View style={styles.profileSection}>
            <View style={styles.statusIndicator} />
          </View>
        </View>

        <View style={styles.ticketsContainer}>
          <Text style={styles.ticketsText}>🏆</Text>
          <Text style={styles.ticketsText}>Tickets Completed</Text>
        </View>

        <View style={styles.userInfoSection}>
          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Username</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                />
              ) : (
                <Text style={styles.value}>{userData?.username ?? ""}</Text>
              )}
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter Email"
                />
              ) : (
                <Text style={styles.value}>{userData?.email ?? ""}</Text>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Role</Text>
              <Text style={styles.value}>{userData?.role ?? ""}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={phonenumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter Phone Number"
                />
              ) : (
                <Text style={styles.value}>{userData?.phonenumber ?? ""}</Text>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.infoItem}>
              <Text style={styles.label}>Date of Birth</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={dob}
                  onChangeText={setDOB}
                  placeholder="Enter Date Of Birth"
                />
              ) : (
                <Text style={styles.value}>{userData?.dob ?? ""}</Text>
              )}
            </View>
          </View>
          <Divider style={styles.divider} />
        </View>

        <Button
          onPress={() => {
            if (!isEditing) {
              setUsername(null);
              setEmail(null);
              setPhoneNumber(null);
              setDOB(null);
            }
            setIsEditing(!isEditing);

            
          }}

          style={styles.editDetails}
        >
          {isEditing ? "Save Changes?" : "Edit User Details" }
        </Button>

        <Button onPress={logout} style={styles.logoutButton}>
          Logout
        </Button>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollContent: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 25,
  },
  logoPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -100,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  profileSection: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 5,
    borderColor: '#333',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  statusIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#61D861',
    position: 'absolute',
    bottom: 10,
    right: 10,
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  ticketsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  ticketsText: {
    color: '#2e2e2eff',
    fontSize: 20,
    marginHorizontal: 5,
  },
  ticketsCount: {
    color: '#575656ff',
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: 5,
  },
  userInfoSection: {
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    width: '48%',
  },
  label: {
    color: '#363636ff',
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
input: {
  fontSize: 16,
  color: '#b8b8b8ff',
  height: 22, 
  paddingVertical: 0,
  marginVertical: 0,
},
  divider: {
    backgroundColor: '#444',
    marginVertical: 10,
  },
  logoutButton: {
    width: '60%',
    bottom: -20,
    alignSelf: 'center',
  },
  editDetails: {
    width: '90%',
    bottom: 0,
    alignSelf: 'center',
  },
});

export default ProfileScreen;
