import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages';
import BackOffice from './pages/backoffice';
import BackOfficeDashboard from './pages/backoffice/backOfficeDashboard';
import BackOfficeInvoice from './pages/backoffice/backOfficeInvoice';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index />} />
        {/* Parent route */}
        <Route path='/dashboard/backoffice' element={<BackOffice />}>
          {/* Nested child route */}
          <Route index element={<BackOfficeDashboard />} />
          <Route path='invoices' element={<BackOfficeInvoice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
