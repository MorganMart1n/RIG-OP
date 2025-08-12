import React from 'react';
import { Input, Button, Card, Text } from '@ui-kitten/components';
import { StyleSheet, View, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from "@react-native-picker/picker";

function CreateScreen() {
    const navigation = useNavigation();

    const [fname, setFname] = React.useState('');
    const [sname, setSname] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);


    async function handleCreateAccount() {

        if (!fname || !sname || !password || !email || !role) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://192.168.4.50:8081/createAccount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fname, sname, email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {

                throw new Error(data.message || 'Account creation failed.');
            } else {
                Alert.alert('Success', 'Account created successfully!');

                navigation.navigate('MainTabs');
            }
        } catch (error) {
            console.error('Creation Error:', error);
            Alert.alert('Creation Failed', error.message || 'Unable to connect to the server.');
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
                    id='fname'
                    style={styles.input}
                    placeholder='First Name'
                    value={fname}
                    onChangeText={setFname}
                />
                <Input
                    id='sname'
                    style={styles.input}
                    placeholder='Surname'
                    value={sname}
                    onChangeText={setSname}
                />
                <Input
                    id='email'
                    style={styles.input}
                    placeholder='Email'
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <Input
                    id='password'
                    style={styles.input}
                    placeholder='Password'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <Input
                    id='confirmPassword'
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
        
            <Text style={styles.TextLink} onPress={() => navigation.navigate('Login')}>Click To Access Login</Text>
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
        marginVertical: 120,
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
