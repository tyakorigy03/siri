import { Outlet } from 'react-router-dom'
import ManagerLayout from '../../components/layouts/managerLayout'

export default function BackOffice() {
  return (
    <ManagerLayout>
      <Outlet/>
    </ManagerLayout>
  )
}
