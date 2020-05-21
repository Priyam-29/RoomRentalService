import React, { useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import Main from "./Components/main";
import ThankYou from "./Components/Thankyou";
import Navbar from "./Components/navbar";

// class App extends Component {
//   render() {
//     return (
//     <div>
//       <div className="App">
//         <div className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <h2>Welcome to React</h2>
//         </div>
//         <p className="App-intro">
//           To get started, edit <code>src/App.js</code> and save to reload.
//         </p>
//       </div>
//       </div>
//     );
//   }
// }

export default _ => {
  const [page, setPage] = useState(0);

  return (
    <div>
      <Navbar setPage={setPage} />
      {page === 0 ? <Main setPage={setPage} /> : null}
      {page === 2 ? <ThankYou /> : null}
    </div>
  );
};
