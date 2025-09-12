import React, { useState } from 'react';
import { Input, Button, Card, Text } from '@ui-kitten/components';
import { StyleSheet, View, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '@env';

function CreateScreen() {
  const navigation = useNavigation();

  const [fname, setFname] = useState('');
  const [sname, setSname] = useState('');
  const [email, setEmail] = useState('');
  const [phonenumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');
  const isActive = false;
  const [isLoading, setIsLoading] = useState(false);

  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); 
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  async function handleCreateAccount() {
    if (!fname || !sname || !email || !phonenumber || !password || !role || !dob) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/createAccount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fname,
          sname,
          email,
          phonenumber,
          password,
          role,
          isActive,
          dob,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account creation failed.');
      } else {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Creation Error:', error);
      Alert.alert('Creation Failed', error.message || 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require('../../assets/Bar-Logo.png')} />
          </View>
          <Card style={styles.card}>
            <Input
              style={styles.input}
              placeholder='First Name'
              value={fname}
              onChangeText={setFname}
            />
            <Input
              style={styles.input}
              placeholder='Surname'
              value={sname}
              onChangeText={setSname}
            />
            <Input
              style={styles.input}
              placeholder='Email'
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              style={styles.input}
              placeholder='Phone Number'
              value={phonenumber}
              onChangeText={setPhoneNumber}
            />

            <Text style={styles.label}>Date of Birth:</Text>
            <View style={styles.dateInput}>
              <Text 
                style={dob ? styles.dateText : styles.placeholder} 
                onPress={() => setShowDatePicker(true)}
              >
                {dob ? dob.toDateString() : 'Select your date of birth'}
              </Text>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={dob || new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}

            <Input
              style={styles.input}
              placeholder='Password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Input
              style={styles.input}
              placeholder='Confirm Password'
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Select Your Role:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Choose your role" value="" />
                <Picker.Item label="Cleaning Team" value="Cleaning" />
                <Picker.Item label="IT Team" value="IT" />
                <Picker.Item label="Mechanical Team" value="Mechanic" />
                <Picker.Item label="Medical Team" value="Medic" />
              </Picker>
            </View>

            <Button style={styles.button} onPress={handleCreateAccount} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </Card>

          <Text style={styles.TextLink} onPress={() => navigation.navigate('Login')}>
            Click To Access Login
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: '#fff'
  },
  logoContainer: {
    position: 'absolute',
    top: -50,
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    resizeMode: 'contain',
    height: 300,
    width: 300,
  },
  card: {
    width: '90%',
    marginTop: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  input: {
    marginVertical: 20,
    shadowColor: '#ffffffff',
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  dateInput: {
    marginVertical: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#706262ff',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholder: {
    fontSize: 16,
    color: '#999',
  },
  button: {
    margin: 10,
    backgroundColor: '#001242',
  },
  TextLink: {
    marginVertical: 40,
  },
  label: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8f9bb3' 
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});

export default CreateScreen;
