import React from 'react';

import { Input, Button, Card, Text } from '@ui-kitten/components';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";
  function handleLogin(){

  }



function CreateScreen() {
  const navigation = useNavigation();
      const [fname, setfname] = React.useState('');
      const [sname, setsname] = React.useState('');
      const [password, setPassword] = React.useState('');
      const [confirmPassword, setconfirmPassword] = React.useState('');
      const [email, setemail] = React.useState('');
      const [selected, setSelected] = React.useState('');
      const [isLoading, setIsLoading] = React.useState(false);
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={require('../../assets/Bar-Logo.png')} />
      </View>
      <Card style={styles.card}>
        <Input
          id='fname'
          style={styles.input}
          placeholder='First Name'
          value={fname}
          onChangeText={nextValue => setfname(nextValue)}
        />
        <Input
          id='sname'
          style={styles.input}
          placeholder='Surname'
          value={sname}
          onChangeText={nextValue => setsname(nextValue)}
        />
        <Input
          id='email'
          style={styles.input}
          placeholder='Email'
          value={email}
          onChangeText={nextValue => setemail(nextValue)}
        />

        <Input
          id='password'
          style={styles.input}
          placeholder='Password'
          value={password} 
          onChangeText={nextValue => setPassword(nextValue)}
          secureTextEntry 
        />
        <Input
          id='confirmPassword'
          style={styles.input}
          placeholder='Confirm Password'
          value={confirmPassword} 
          onChangeText={nextValue => setconfirmPassword(nextValue)}
          secureTextEntry 
        />
        <Text style={styles.label}>Select Role:</Text>
            <Picker
          selectedValue={selected}
          onValueChange={(itemValue) => setSelected(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Choose your role" value="" />
            <Picker.Item label="Cleaning Team" value="Cleaning" />
            <Picker.Item label="IT Team" value="IT" />
            <Picker.Item label="Mechanical Team" value="Mechanic" />
            <Picker.Item label="Medical Team" value="Medic" />
          </Picker>
        <Text style={styles.result}>Selected: {selected}</Text>

        <Button style={styles.button} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Submit'}
        </Button>



       <Text styles={styles.TextLink} onPress={() => navigation.navigate('Login')}>Click To Login</Text>
      </Card>
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
  title: { 
    marginBottom: 10,
     fontSize: 16,
      fontWeight: 'bold' },

  dropdown: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  selectedStyle: {
    borderRadius: 12,
  },
  result: { 
    marginTop: 20, 
    fontSize: 14 },
});

export default CreateScreen;