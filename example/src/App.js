import logo from './logo.svg';
import './App.css';
import Globalstate from 'react-global-state-management/dist/index'
const data = Globalstate({
  counter: 0,
  counter2: 0
})

function App() {
  data.hook();

  data.subscribe((item, props)=> {
    console.log("props", props)
  })
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="App-link"
          onClick={() => data.counter = data.counter2++}>
          increase Counter: {data.counter}
        </a>
      </header>


    </div>
  );
}

export default App;
