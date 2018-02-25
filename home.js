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
  ScrollView,
  View
} from 'react-native';

var base64 = require('base-64');
var utf8 = require('utf8');

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
          "0,0",
          "0,0",
          "0,0",
          "0,0",
          "0,0"
        ],
        dataVals: [
          [ 50, 10, 40, 95, 4, 24, 85, 91, 35, 53, 53, 24, 50, 20, 80 ],
          [0, 0, 0],
          [0,0,0],
          [0,0,0],
          [0,0,0]
        ],
        ttsOn: false,
        killed: false
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
        if (device.name === 'PocketSensy' || device.name === 'PocketSen' ||
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
    this.iters += 1;
    var toCheck = [
      "19B10001-E8F2-537E-4F6C-D104768A1215",
      "19B10002-E8F2-537E-4F6C-D104768A1215",
      "19B10003-E8F2-537E-4F6C-D104768A1215",
      "19B10004-E8F2-537E-4F6C-D104768A1215",
      "19B10005-E8F2-537E-4F6C-D104768A1215"
    ];
    // Read only three sensors
    for (var i = 0; i < 3; i++) {
      this.manager.readCharacteristicForDevice(
        this.device.id,
        "19B10000-E8F2-537E-4F6C-D104768A1215",
        toCheck[i]
      ).then((characteristic) => {
        var data = characteristic.value;
        //data = 'Zm9vIMKpIGJhciDwnYyGIGJheg==';
        data = "MTA=";
        var newVal = base64.decode(data);
        //var newVal = utf8.decode(bytes);
          //Alert.alert("Hey: " + newVal);
          this.state.dataVals[i] = this.state.dataVals[i].concat([newVal]);
      })
      .catch((error) => {
        Alert.alert("An error occured. Restart the app.\n" + error);
        this.setState({ killed: true })
      });
      this.setState({
        dataVals: this.state.dataVals,
      })
    }
    // Speak every 4 seconds
    if (this.state.ttsOn && (this.iters % 20) == 0) {
      Tts.speak("Voltage " + this.state.dataVals[0][this.state.dataVals[0].length - 1])
    }
  }
  updateGraph() {
    //this.checkCharacteristics();
    for (var i = 0; i < 3; i++) {
      var values = this.state.dataVals[i];
      var points = "";
      var start = 0;
      if (values.length > 200) {
        start = values.length - 200;
      }
      for (var i = 0; i < values.length; i++) {
        points += i + ',' + 5 + ' ';
      }
      // Speak every 4 seconds
      if (this.state.ttsOn && (this.iters % 20) == 0) {
        Tts.speak("Voltage " + values[values.length - 1])
      }
      this.state.points[i] = points;
    }
    //Alert.alert(points)
    this.setState({ points: points });
  }
  startUpdate() {
    var update = () => {
      if (!this.state.killed) {
        this.checkCharacteristics();
      }
    }
    setInterval(update, 200);
  }
  render() {
    return (
      <ScrollView style={{paddingLeft: 10, paddingRight: 10, flex: 1}}>
        <Text style={styles.welcome}>
          {this.state.header}
        </Text>
        {this.state.bodyMessage}
        <Text>{this.state.statusMessage}</Text>
        <Button onPress={() => {this.setState({ ttsOn: !this.state.ttsOn});}} title="Toggle Speech" />
            <View width={300} height={200}>
            <Text>Voltage</Text>
            <AreaChart
                style={ { height: 200 } }
                data={ this.state.dataVals[0] }
                contentInset={ { top: 30, bottom: 30 } }
                curve={shape.curveNatural}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            />
            </View>
            <View width={300} height={200}>
            <Text>Temp</Text>
            <AreaChart
                style={ { height: 200 } }
                data={ this.state.dataVals[1] }
                contentInset={ { top: 30, bottom: 30 } }
                curve={shape.curveNatural}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            />
            </View>
            <View width={300} height={200}>
            <Text>Acceleration</Text>
            <AreaChart
                style={ { height: 200 } }
                data={ this.state.dataVals[2] }
                contentInset={ { top: 30, bottom: 30 } }
                curve={shape.curveNatural}
                svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
            />
            </View>
      </ScrollView>
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
