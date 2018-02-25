/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Setup BLE
import { BleManager } from 'react-native-ble-plx';

// Setup graphing
import { AreaChart } from 'react-native-svg-charts'
import * as shape from 'd3-shape'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

var statusMessage = ":(";

type Props = {};
export default class App extends Component<Props> {
  constructor() {
      super();
      this.manager = new BleManager();
  }
  componentWillMount() {
    const subscription = this.manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
            this.scanAndConnect();
            subscription.remove();
        }
    }, true);
  }
  scanAndConnect() {
    this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
            // Handle error (scanning will be stopped automatically)
            return
        }

        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        if (device.name === 'PocketSensy' ||
            device.name === 'ARDUINO 101-AD6F') {

            // Stop scanning as it's not necessary if you are scanning for one device.
            this.manager.stopDeviceScan();

            // Proceed with connection.
          device.connect()
          .then((device) => {
            statusMessage = "Yay!";
            Alert.alert("Connected...");
              return device.discoverAllServicesAndCharacteristics()
          })
          .then((device) => {
             // Do work on device with services and characteristics
          })
          .catch((error) => {
              // Handle errors
          });
        }
    });
  }
  render() {
    const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Get ready for awesome.
        </Text>
        <Text style={styles.instructions}>
          App is currently waiting for Bluetooth connection. Make sure your Pocket Sensy is powered on.
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <Text>{statusMessage}</Text>
            <AreaChart
                style={ { height: 200 } }
                data={ data }
                contentInset={ { top: 30, bottom: 30 } }
                curve={shape.curveNatural}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
