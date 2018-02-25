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
  FlatList,
  Button,
  View
} from 'react-native';

var base64 = require('base-64');

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

// Setup TTS
import Tts from 'react-native-tts';

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
      this.iters = 0;
      this.state = {
        bodyMessage: (<View><Text style={styles.instructions}>
          App is currently waiting for Bluetooth connection. Make sure your Pocket Sensy is powered on.
        </Text><Text style={styles.instructions}>
          {instructions}
        </Text></View>),
        header: 'Get ready for awesome.',
         statusMessage: 'Connecting...',
        points: [
          "",
          "",
          "",
          "",
          ""
        ],
        dataVals: [
          [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ],
          [],
          [],
          [],
          []
        ],
        ttsOn: false
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
              this.setState({ 
                bodyMessage: (<View></View>),
                header: "Connected",
                statusMessage: "ID: " + device.id
              });
                return device.discoverAllServicesAndCharacteristics()
            })
            .then((device) => {
               // Do work on device with services and characteristics
              this.device = device;
              this.startUpdate();
            })
            .catch((error) => {
                // Handle errors
              Alert.alert("An error occured: " + error);
            });
        }
    });
  }
  checkCharacteristics() {
    var toCheck = [
      "19B10000-E8F2-537E-4F6C-D104768A1214",
      "19B10000-E8F2-537E-4F6C-D104768A1215",
      "19B10000-E8F2-537E-4F6C-D104768A1216",
      "19B10000-E8F2-537E-4F6C-D104768A1217",
      "19B10000-E8F2-537E-4F6C-D104768A1218"
    ];
    for (var i = 0; i < 5; i++) {
      this.manager.readCharacteristicForDevice(
        this.device.id,
        "19B10000-E8F2-537E-4F6C-D104768A1214",
        toCheck[i]
      ).then((characteristic) => {
        var data = characteristic.value;
        var newVal = base64.decode(data);
          //Alert.alert("Hey: " + newVal);
          if (data != "C") {
            this.state.dataVals[i] = this.state.dataVals[0].concat([newVal]);
          }
      });
      this.setState({
        dataVals: this.state.dataVals,
      })
    }
  }
  updateGraph() {
    this.iters += 1;
    this.checkCharacteristics();
    var values = this.state.dataVals[0];
    var points = "";
    var start = 0;
    if (values.length > 200) {
      start = values.length - 200;
    }
    for (var i = 0; i < values.length; i++) {
      points += i + ',' + 5 + ' ';
    }
    if (this.state.ttsOn && (this.iters % 10) == 0) {
      Tts.speak("Voltage " + values[values.length - 1])
    }
    Alert.alert(values);
    this.state.points[0] = points;
    this.setState({ points: points });
  }
  startUpdate() {
    var update = () => {
      this.updateGraph();
    }
    setInterval(update, 200);
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          {this.state.header}
        </Text>
        {this.state.bodyMessage}
        <Text>{this.state.statusMessage}</Text>
        <Button onPress={() => {this.setState({ ttsOn: !this.state.ttsOn});}} title="Toggle Speech" />
            <View width={200} height={100}>
            <Text>Voltage</Text>
            <Svg
            height="100"
            width="200"
            >
                <Polyline
                    points={this.state.points[0]}
                    fill="none"
                    stroke="black"
                    strokeWidth="3"
                />
            </Svg> 
            </View>
<FlatList
  data={this.state.data}
  renderItem={({item}) => (
    <MyItem
      item={item}
      onPress={() =>
        this.setState((oldState) => ({
          selected: {
            // New instance breaks `===`
            ...oldState.selected, // copy old data
            [item.key]: !oldState.selected[item.key], // toggle
          },
        }))
      }
      selected={
        !!this.state.selected[item.key] // renderItem depends on state
      }
    />
  )}
  selected={
    // Can be any prop that doesn't collide with existing props
    this.state.selected // A change to selected should re-render FlatList
  }
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
    marginLeft: 5,
    marginRight: 5
  },
});
