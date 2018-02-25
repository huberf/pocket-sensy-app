import { AppRegistry } from 'react-native';
import React, { Component } from 'react';

import {
  Scene,
  Reducer,
  Router,
  Switch,
  Modal,
  Actions,
  ActionConst,
} from 'react-native-router-flux';

import homePage from './home';
import sensorPage from './sensorScreen';

const reducerCreate = params => {
  const defaultReducer = new Reducer(params);
  return (state, action) => {
    console.log('ACTION:', action);
    return defaultReducer(state, action);
  };
};

export default class App extends Component {
  render() {
        return (
      <Router createReducer={reducerCreate}>
        <Scene key="root" unmountScenes={false}>
          <Scene key="home" component={homePage} title="Sensy Home" type={ActionConst.REPLACE} initial={true} />
          <Scene key="sensorScreen" component={sensorPage} title="Sensor" />
        </Scene>
      </Router>
        );
  }
}

AppRegistry.registerComponent('makecuapp', () => App);
