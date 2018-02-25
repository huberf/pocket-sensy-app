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
  Alert,
  View
} from 'react-native';

// Setup BLE
import { BleManager } from 'react-native-ble-plx';

// Setup graphing
import { AreaChart } from 'react-native-svg-charts'
import { ProgressCircle } from 'react-native-svg-charts'
import * as shape from 'd3-shape'
import Svg,{
    Circle,
    Ellipse,
    G,
    LinearGradient,
    RadialGradient,
    Line,
    Path,
    Polygon,
    Polyline,
    Rect,
    Symbol,
    Use,
    Defs,
    Stop
} from 'react-native-svg';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
    'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {
  constructor() {
      super();
      this.state = {
         statusMessage: 'Connecting...'
      }
    this.device = null;
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
              this.state.statusMessage = "Connected!\nID: " + device.id;
              Alert.alert("Connected!");
                return device.discoverAllServicesAndCharacteristics()
            })
            .then((device) => {
               // Do work on device with services and characteristics
              this.device = device;
            })
            .catch((error) => {
                // Handle errors
              Alert.alert("An error occured: " + error);
            });
        }
    });
  }
  checkCharacteristics() {
    /*
    writeCharacteristicWithoutResponseForDevice(
      deviceIdentifier: DeviceId,
      serviceUUID: UUID,
      characteristicUUID: UUID,
      base64Value: Base64);
              Alert.alert(device.id);
    */
    var device = this.device;
    BleManager.readCharacteristicForDevice(
      deviceIdentifier: device,
      serviceUUID: "19B10000-E8F2-537E-4F6C-D104768A1214",
      characteristicUUID: "19B10001-E8F2-537E-4F6C-D104768A1214"
    ).then((characteristic) => {
      Alert.alert(characteristic.value);
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
        <Text>{this.state.statusMessage}</Text>
        <Text onPress={() => {this.checkCharacteristics()}}> Press Me!</Text>
          <AreaChart
                style={ { height: 200 } }
                data={ data }
                contentInset={ { top: 30, bottom: 30 } }
                curve={shape.curveNatural}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            />
      <Svg
    height="150"
    width="110"
>
    <Symbol id="symbol" viewBox="0 0 150 110" width="100" height="50">
        <Circle cx="50" cy="50" r="40" strokeWidth="8" stroke="red" fill="red"/>
        <Circle cx="90" cy="60" r="40" strokeWidth="8" stroke="green" fill="white"/>
    </Symbol>

    <Use
        href="#symbol"
        x="0"
        y="0"
    />
    <Use
        href="#symbol"
        x="0"
        y="50"
        width="75"
        height="38"
    />
    <Use
        href="#symbol"
        x="0"
        y="100"
        width="50"
        height="25"
    />
</Svg>
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
    marginLeft: 5,
    marginRight: 5
  },
});
