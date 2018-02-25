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
var Buffer = require('buffer/').Buffer 

// Setup BLE
import { BleManager } from 'react-native-ble-plx';

// Setup graphing
import { AreaChart, YAxis } from 'react-native-svg-charts'
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
  ios: 'Make sure Bluetooth is enabled',
  android: 'Make sure Bluetooth is enabled',
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
        sensorNames: [
          "Voltage",
          "Temp",
          "Acceleration",
          "Humidity",
          "Light"
        ],
        dataVals: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
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
    // For demoing data load.
    this.demoUpdate();
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
        this.state.points[i] = data;
        this.setState({ points: this.state.points})
        //data = 'Zm9vIMKpIGJhciDwnYyGIGJheg==';
        //data = "MTA=";
        //var newVal = base64.decode(data);
        var b = new Buffer(data, 'base64')
        var newVal = b.toString();
        //var newVal = utf8.decode(bytes);
          //Alert.alert("Hey: " + newVal);
          this.state.dataVals[i] = this.state.dataVals[i].concat([newVal]);
          this.state.dataVals[i] = this.state.dataVals[i].concat([5]);
          this.state.dataVals[i] = this.state.dataVals[i].slice(1);
          this.setState({
            dataVals: this.state.dataVals,
          })
      })
      .catch((error) => {
        Alert.alert("An error occured. Restart the app.\n" + error);
        this.setState({ killed: true })
      });
    }
    // Speak every 4 seconds
    if (this.state.ttsOn && (this.iters % 20) == 0) {
      Tts.speak("Voltage " + this.state.dataVals[0][this.state.dataVals[0].length - 1])
    }
  }
  updateGraph() {
    this.state.dataVals[0] = this.state.dataVals[0].concat([Math.random()]);
    this.state.dataVals[0] = this.state.dataVals[0].slice(1);
    this.state.dataVals[1] = this.state.dataVals[1].concat([Math.random()]);
    this.state.dataVals[1] = this.state.dataVals[1].slice(1);
    this.state.dataVals[2] = this.state.dataVals[2].concat([Math.random()]);
    this.state.dataVals[2] = this.state.dataVals[2].slice(1);
    this.setState({
      dataVals: this.state.dataVals,
    })
  }
  startUpdate() {
    var update = () => {
      if (!this.state.killed) {
        this.checkCharacteristics();
      }
    }
    setInterval(update, 200);
  }
  demoUpdate() {
    var update = () => {
      if (!this.state.killed) {
        this.updateGraph();
      }
    }
    setInterval(update, 100);
  }
  render() {
    return (
      <ScrollView style={{paddingLeft: 10, paddingRight: 10, flex: 1}}>
        <Text style={styles.welcome}>
          {this.state.header}
        </Text>
        {this.state.bodyMessage}
        <Text>{this.state.statusMessage}</Text>
        <Button onPress={() => {this.setState({ ttsOn: !this.state.ttsOn});}} color="#841584" title="Toggle Speech" />

            <View width={350} height={300}>
              <View style={{flexDirection: 'row'}}>
                <Text>{this.state.sensorNames[0]}</Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Text>Raw Value: {this.state.dataVals[0][this.state.dataVals[0].length-1]}</Text>
                </View>
              </View>
              <View style={ { height: 200, flexDirection: 'row' } }>
                  <YAxis
                    data={this.state.dataVals[0]}
                    contentInset={ { top: 0, bottom: 0 } }
                    svg={{
                        fill: 'grey',
                        fontSize: 10,
                    }}
                    formatLabel={ value => `${value} V` }
                  />
                  <AreaChart
                      style={ { flex: 1, marginLeft: 16 } }
                      data={ this.state.dataVals[0] }
                      contentInset={ { top: 30, bottom: 30 } }
                      curve={shape.curveNatural}
                      svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                      contentInset={{ top: 0, bottom: 0 }}
                  />
              </View>
            </View>
            <View width={350} height={300}>
              <View style={{flexDirection: 'row'}}>
                <Text>{this.state.sensorNames[1]}</Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Text>Raw Value: {this.state.dataVals[1][this.state.dataVals[1].length-1]}</Text>
                </View>
              </View>
              <View style={ { height: 200, flexDirection: 'row' } }>
                  <YAxis
                    data={this.state.dataVals[1]}
                    contentInset={ { top: 0, bottom: 0 } }
                    svg={{
                        fill: 'grey',
                        fontSize: 10,
                    }}
                    formatLabel={ value => `${value} ºF` }
                  />
                  <AreaChart
                      style={ { flex: 1, marginLeft: 16 } }
                      data={ this.state.dataVals[1] }
                      contentInset={ { top: 30, bottom: 30 } }
                      curve={shape.curveNatural}
                      svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                      contentInset={{ top: 0, bottom: 0 }}
                  />
              </View>
            </View>
            <View width={350} height={300}>
            <View style={{flexDirection: 'row'}}>
                <Text>{this.state.sensorNames[2]}</Text>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Text>Raw Value: {this.state.dataVals[2][this.state.dataVals[2].length-1]}</Text>
                </View>
              </View>
              <View style={ { height: 200, flexDirection: 'row' } }>
                  <YAxis
                    data={this.state.dataVals[2]}
                    contentInset={ { top: 0, bottom: 0 } }
                    svg={{
                        fill: 'grey',
                        fontSize: 10,
                    }}
                    formatLabel={ value => `${value} N` }
                  />
                  <AreaChart
                      style={ { flex: 1, marginLeft: 16 } }
                      data={ this.state.dataVals[2] }
                      contentInset={ { top: 30, bottom: 30 } }
                      curve={shape.curveNatural}
                      svg={{ fill: 'rgba(134, 65, 244, 0.8)' }}
                      contentInset={{ top: 0, bottom: 0 }}
                  />
              </View>
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
