import logo from './logo.svg';
import './App.css';
import Globalstate from 'react-global-state-management'
const data = Globalstate({
  counter: 0
})

function App() {
  data.hook();
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
        onClick={()=> data.counter++}>
        increase Counter: {data.counter}
      </a>
      </header>

   
    </div>
  );
}

export default App;
