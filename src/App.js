import React, { Component } from 'react';
import { GameChart } from './GameChart';

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      title: 'The Weight of Trains'
    }
  }
  
  render() {
    return (
      <div className="App">
        <h1>{this.state.title}</h1>
        <GameChart />
      </div>
    );
  }
}

export default App;