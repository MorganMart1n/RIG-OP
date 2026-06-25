import React from 'react';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './layout';

export default function App() {
  return (
    <ApplicationProvider {...eva} theme={eva.light}>
      <NavigationContainer>
        <Layout />
      </NavigationContainer>
    </ApplicationProvider>
  );
}

// Navigation structure has moved to ./Pages/layout.js
// Stack: Login → create → MainTabs
// Tabs:  Home | Assets | + Log | Maintenance | Profile
// Log hub pushes stack screens: AssetCreate, LogMaintenance, LogFailure, LogInspection