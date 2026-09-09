import { Navigate, Route, Routes } from 'react-router-dom'
import { MobileLayout } from '@/screens/mobile/MobileLayout'
import { WorkList } from '@/screens/mobile/WorkList'
import { NhapDetail } from '@/screens/mobile/NhapDetail'
import { CatDetail } from '@/screens/mobile/CatDetail'
import { SoanDetail } from '@/screens/mobile/SoanDetail'
import { Khac } from '@/screens/mobile/Khac'
import { NhanHang } from '@/screens/mobile/NhanHang'
import { CaNhan } from '@/screens/mobile/CaNhan'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/m" replace />} />
        <Route path="/m" element={<MobileLayout />}>
          <Route index element={<WorkList />} />
          <Route path="nhap/:asnId" element={<NhapDetail />} />
          <Route path="cat/:taskId" element={<CatDetail />} />
          <Route path="soan/:orderId" element={<SoanDetail />} />
          <Route path="khac" element={<Khac />} />
          <Route path="nhan-hang" element={<NhanHang />} />
          <Route path="canhan" element={<CaNhan />} />
        </Route>
        <Route path="*" element={<Navigate to="/m" replace />} />
      </Routes>
    </>
  )
}
