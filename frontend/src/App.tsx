/**
 * Main App component with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WeekWorkspace from './pages/WeekWorkspace';
import Courses from './pages/Courses';
import Documents from './pages/Documents';
import GeneralInstructions from './pages/GeneralInstructions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="workspace" element={<WeekWorkspace />} />
          <Route path="courses" element={<Courses />} />
          <Route path="documents" element={<Documents />} />
          <Route path="instructions" element={<GeneralInstructions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
