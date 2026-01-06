import { Outlet } from 'react-router-dom'
import ManagerLayout from '../../components/layouts/managerLayout'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

export default function BackOffice() {
  return (
    <ProtectedRoute>
      <ManagerLayout>
        <Outlet/>
      </ManagerLayout>
    </ProtectedRoute>
  )
}
