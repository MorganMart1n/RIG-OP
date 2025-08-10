import React from 'react';

import { Input, Button, Card, Text } from '@ui-kitten/components';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';


function LoginScreen() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const navigation = useNavigation();


  async function handleLogin() {

    if (!username || !password) {
      Alert.alert('Error', 'Please fill out both fields before submitting.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

 
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }

      else{
      Alert.alert('Success', 'Login successful!');
      navigation.navigate('MainTabs');
      }
    } catch (error) {
      Alert.alert('Login Failed', error.message || 'Unable to connect to the server.');
    } finally {
      
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../../assets/Bar-Logo.png')} />
      </View>
      <Card style={styles.card}>
        <Input
          id='username'
          style={styles.input}
          placeholder='Username'
          value={username}
          onChangeText={nextValue => setUsername(nextValue)}
        />
        <Input
          id='password'
          style={styles.input}
          placeholder='Password'
          value={password} 
          onChangeText={nextValue => setPassword(nextValue)}
          secureTextEntry 
        />
        
        <Button style={styles.button} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Submit'}
        </Button>
      </Card>
      <Text styles={styles.TextLink} onPress={() => navigation.navigate('Create')}>Click Here to request a Account</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  input: {
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 5,
  },
  button: {
    margin: 10,
    backgroundColor: '#001242',
  },
  TextLink: {
   marginVertical:120,
  },
});

export default LoginScreen;