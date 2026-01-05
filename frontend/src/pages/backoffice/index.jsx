import { Outlet } from 'react-router-dom'
import BackOfficeLayout from '../../components/layouts/backOfficeLayout'

export default function BackOffice() {
  return (
    <BackOfficeLayout>
      <Outlet/>
    </BackOfficeLayout>
  )
}
