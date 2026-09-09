import { Outlet, useLocation } from 'react-router-dom'
import { PhoneFrame } from '@/components/mobile/PhoneFrame'
import { BottomNav } from '@/components/mobile/BottomNav'

const NAV_ROUTES = ['/m', '/m/khac', '/m/canhan']

export function MobileLayout() {
  const { pathname } = useLocation()
  return (
    <PhoneFrame>
      <Outlet />
      {NAV_ROUTES.includes(pathname) && <BottomNav />}
    </PhoneFrame>
  )
}
