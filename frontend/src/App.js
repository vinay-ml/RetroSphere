import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import RetroBoard from "./components/RetroBoard/RetroBoard";
import PreviousRetroBoards from "./components/PreviousRetroBoard/PreviousRetroBoards";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/retroboard" element={<RetroBoard />} />
      <Route path="/previous-retroboards" element={<PreviousRetroBoards />} />
    </Routes>
  </Router>
);

export default App;
