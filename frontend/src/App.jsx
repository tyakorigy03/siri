import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './styles/toast.css';
import Login from './pages/Login';
import BackOffice from './pages/manager';
import BackOfficeInvoice from './pages/manager/managerInvoice';
import ManagerDashboard from './pages/manager/managerDashboard';
import OpenBusinessDay from './components/views/openBussinessDay';
import CashSessionManagement from './components/views/cashSessionManagement';
import CloseBusinessDay from './components/views/closeBusinessDay';
import ExpenseApproval from './components/views/expenseApproval';
import CreateExpense from './components/views/createExpense';
import CreatePurchaseOrder from './components/views/createPurchaseOrder';
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
import AccountsPayable from './components/views/accountsPayable';
import TaxCenter from './components/views/taxCenter';
import StaffCenter from './components/views/staffCenter';
import SalesManagementView from './components/views/salesManagement';
import POSPointOfSale from './components/views/pOSPointOfSales';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        {/* Parent route */}
        <Route path='/dashboard/manager' element={<BackOffice />}>
          {/* Nested child route */}
          <Route index element={<ManagerDashboard />} />
          <Route path='invoices' element={<BackOfficeInvoice />} />
          <Route path='open-business-day' element={<OpenBusinessDay />} />
          <Route path='close-business-day' element={<CloseBusinessDay />} />
          <Route path='cash-session-management' element={<CashSessionManagement />} />
          <Route path='expense-approval' element={<ExpenseApproval />} />
          <Route path='create-expense' element={<CreateExpense />} />
          <Route path='purchase-order-approval' element={<PurchaseOrderApproval />} />
          <Route path='create-purchase-order' element={<CreatePurchaseOrder />} />
          <Route path='daily-report' element={<DailyReports />} />
          <Route path='staff-performance' element={<StaffPerformance />} />
          <Route path='variance-investigation' element={<VarianceInvestigation />} />
          <Route path='inventory-oversight' element={<InventoryOversight />} />
          <Route path='customer-credit-management' element={<CustomerCreditManagement/>} />
          <Route path='accounts-payable' element={<AccountsPayable/>} />
          <Route path='tax-center' element={<TaxCenter/>} />
          <Route path='staff-center' element={<StaffCenter/>} />
          <Route path='audit-trail' element={<AuditTrail/>} />
          <Route path='notifications' element={<NotificationsCenter/>} />
          <Route path='analytics-insights' element={<AnalyticsInsights/>} />
          <Route path='manager-settings' element={<ManagerSettings/>} />
          <Route path='branch-comparison' element={<BranchComparison/>} />
          <Route path='sale-management' element={<SalesManagementView/>} />
          <Route path='pos-point-of-sales' element={<POSPointOfSale/>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
