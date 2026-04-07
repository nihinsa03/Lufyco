import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

const { width, height } = Dimensions.get('screen');

type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Main: undefined;
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
  route: RouteProp<RootStackParamList, 'Splash'>;
};

const SplashScreen = ({ navigation }: Props) => {
  const { isAuthenticated, isOnboarded } = useAuthStore();

  useEffect(() => {
    // Optional: Auto-redirect logic if desired
    // if (isAuthenticated) navigation.replace('Main');
  }, []);

  return (
    <View style={styles.root}>
      {/* Full-bleed background image */}
      <Image
        source={require('../../assets/images/first_screen.png')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      {/* Dark overlay */}
      <View style={styles.overlay} pointerEvents="none" />
      {/* Buttons at the bottom */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Onboarding')}>
          <Text style={styles.btnText}>Get Started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryBtnText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    justifyContent: 'flex-end',
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  content: {
    padding: 30,
    paddingBottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#fff',
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  btnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    padding: 10,
  },
  secondaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SplashScreen;
