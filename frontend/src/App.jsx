import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Index from './pages';
import BackOffice from './pages/manager';
import BackOfficeInvoice from './pages/manager/managerInvoice';
import ManagerDashboard from './pages/manager/managerDashboard';
import OpenBusinessDay from './components/views/openBussinessDay';
import CashSessionManagement from './components/views/cashSessionManagement';
import CloseBusinessDay from './components/views/closeBusinessDay';
import ExpenseApproval from './components/views/expenseApproval';
import PurchaseOrderApproval from './components/views/purchaseOrderApproval';
import DailyReports from './components/views/dailyReport';
import StaffPerformance from './components/views/staffPerformance';
import VarianceInvestigation from './components/views/varianceInvestigation';
import InventoryOversight from './components/views/invetoryOversights';
import CustomerCreditManagement from './components/views/customerCreditManagement';
import ManagerSettings from './components/views/managerSettings';
import AnalyticsInsights from './components/views/analyticsInsights';
import NotificationsCenter from './components/views/notificationCenter';
import AuditTrail from './components/views/auditTrail';
import BranchComparison from './components/views/branchDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Index />} />
        {/* Parent route */}
        <Route path='/dashboard/manager' element={<BackOffice />}>
          {/* Nested child route */}
          <Route index element={<ManagerDashboard />} />
          <Route path='invoices' element={<BackOfficeInvoice />} />
          <Route path='open-business-day' element={<OpenBusinessDay />} />
          <Route path='close-business-day' element={<CloseBusinessDay />} />
          <Route path='cash-session-management' element={<CashSessionManagement />} />
          <Route path='expense-approval' element={<ExpenseApproval />} />
          <Route path='purchase-order-approval' element={<PurchaseOrderApproval />} />
          <Route path='daily-report' element={<DailyReports />} />
          <Route path='staff-performance' element={<StaffPerformance />} />
          <Route path='variance-investigation' element={<VarianceInvestigation />} />
          <Route path='inventory-oversight' element={<InventoryOversight />} />
          <Route path='customer-credit-management' element={<CustomerCreditManagement/>} />
          <Route path='audit-trail' element={<AuditTrail/>} />
          <Route path='notifications' element={<NotificationsCenter/>} />
          <Route path='analytics-insights' element={<AnalyticsInsights/>} />
          <Route path='manager-settings' element={<ManagerSettings/>} />
          <Route path='branch-comparison' element={<BranchComparison/>} />












        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
