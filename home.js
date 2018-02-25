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

var Spinner = require('react-native-spinkit');

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
         connected: false,
         statusMessage: "Connecting...",
        points: [
          "0,0",
          "0,0",
          "0,0",
          "0,0",
          "0,0"
        ],
        sensorNames: [
          "Voltage",
          "Hall Effect",
          "Acceleration",
          "Humidity",
          "Temp"
        ],
        lastVal: 0,
        dataVals: [
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
            device.name === 'ARDUINO 101-AD6F' || device.name === 'ARDUINO 101-AD63') {

            // Stop scanning as it's not necessary if you are scanning for one device.
            this.manager.stopDeviceScan();

            // Proceed with connection.
            device.connect()
            .then((device) => {
              this.setState({ 
                bodyMessage: (<View></View>),
                header: "Connected",
                connected: true,
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
  async checkCharacteristics() {
    this.iters += 1;
    var toCheck = [
      "19B10001-E8F2-537E-4F6C-D104768A1215",
      "19B10002-E8F2-537E-4F6C-D104768A1215",
      "19B10003-E8F2-537E-4F6C-D104768A1215",
      "19B10004-E8F2-537E-4F6C-D104768A1215",
      "19B10005-E8F2-537E-4F6C-D104768A1215"
    ];
    var ALPHABET = {'-': 62, '1': 53, '0': 52, '3': 55, '2': 54, '5': 57, '4': 56, '7': 59, '6': 58, '9': 61, '8': 60, 'A': 0, 'C': 2, 'B': 1, 'E': 4, 'D': 3, 'G': 6, 'F': 5, 'I': 8, 'H': 7, 'K': 10, 'J': 9, 'M': 12, 'L': 11, 'O': 14, 'N': 13, 'Q': 16, 'P': 15, 'S': 18, 'R': 17, 'U': 20, 'T': 19, 'W': 22, 'V': 21, 'Y': 24, 'X': 23, 'Z': 25, '_': 63, 'a': 26, 'c': 28, 'b': 27, 'e': 30, 'd': 29, 'g': 32, 'f': 31, 'i': 34, 'h': 33, 'k': 36, 'j': 35, 'm': 38, 'l': 37, 'o': 40, 'n': 39, 'q': 42, 'p': 41, 's': 44, 'r': 43, 'u': 46, 't': 45, 'w': 48, 'v': 47, 'y': 50, 'x': 49, 'z': 51};

    /*async function decode(s, invoke, location) {
      var n = 0;
      let result = '';
      for(var i=0; i <= s.length; i++) {
        if (i == s.length) {
          Alert.alert(n);
          await invoke(n, location);
          continue;
        }
          var c = s.charAt(i);
          n = n * 64 + ALPHABET[c];
          //Alert.alert('Hey: ' + n);
      }
    }*/
    var decode = (s, invoke, location) => {
      this.state.points[location] = s;
      this.setState({ points: this.state.points });
        var n = 0;
        let result = '';
        for(var i=0; i <= s.length; i++) {
          if (i == s.length) {
            //Alert.alert('Hey: ' + n);
            invoke(n, location);
            continue;
          }
            var c = s.charAt(i);
            n = n * 64 + ALPHABET[c];
            invoke(n, location);
        }
    }
    var setter = (data, location) => {
      //Alert.alert(data);
      //Alert.alert(newVal)
      //var newVal = utf8.decode(bytes);
        //Alert.alert("Hey: " + newVal);
        //this.state.dataVals[i] = this.state.dataVals[i].concat([newVal]);
        //Alert.alert(data);
        //this.state.dataVals[i] = this.state.dataVals[i].concat([data]);
        //this.state.dataVals[i] = this.state.dataVals[i].slice(1);
        this.setState({
          dataVals: this.state.dataVals,
        })
    }
    // Read all sensors
    for (var i = 0; i < 4; i++) {
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
        //var b = new Buffer(data, 'base64')
        //var newVal = b.toString();
        newVal = decode(data, setter, i);
        this.setState({ points: [data, "0","0","0","0"]});
      })
      .catch((error) => {
        Alert.alert("An error occured. Restart the app.\n" + error);
        this.setState({ killed: true })
      });
    }
    // Speak every 4 seconds
    if (this.state.ttsOn && (this.iters % 20) == 0) {
      //this.state.lastVal = this.state.dataVals[0][this.state.dataVals[0].length - 1];
      Tts.speak("Voltage " + this.state.dataVals[0][this.state.dataVals[0].length - 1])
    }
  }
  updateGraph() {
    this.iters+=1;
    this.state.dataVals[0] = this.state.dataVals[0].concat([Math.random()]);
    this.state.dataVals[0] = this.state.dataVals[0].slice(1);
    this.state.dataVals[1] = this.state.dataVals[1].concat([Math.random()]);
    this.state.dataVals[1] = this.state.dataVals[1].slice(1);
    this.state.dataVals[2] = this.state.dataVals[2].concat([Math.random()]);
    this.state.dataVals[2] = this.state.dataVals[2].slice(1);
    this.setState({
      dataVals: this.state.dataVals,
    })
    // Speak every 4 seconds
    if (this.state.ttsOn && (this.iters % 20) == 0) {
      //this.state.lastVal = this.state.dataVals[0][this.state.dataVals[0].length - 1];
      Tts.speak("Voltage " + this.state.dataVals[0][this.state.dataVals[0].length - 1])
    }
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
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Spinner style={{marginTop: 10, marginBottom: 50, textAlign: 'center'}} isVisible={!this.state.connected} size={50} type={'FadingCircle'} color={'black'}/>
        </View>
        <Text style={styles.instructions}>{this.state.statusMessage}</Text>
        <Button onPress={() => {this.setState({ ttsOn: !this.state.ttsOn});}} color="#841584" title="Toggle Speech" />

            <View width={350} height={300}>
              <View style={{flexDirection: 'row'}}>
                <Text>{this.state.sensorNames[0]}</Text>
                <Text>{this.state.points[0]}</Text>
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
