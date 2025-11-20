import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

// 레이아웃
import Layout from "../features/layout/Layout";

// 페이지 컴포넌트
import Main from "../pages/MainPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ClassDetail from "../pages/ClassDetail";
import ClassRegister from "../pages/ClassRegister";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentWidgetModal from "../features/payment/PaymentModal";
import MyReservations from "../pages/MyReservations";
import TeacherPage from "../pages/TeacherPage";

const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 헤더/푸터가 필요한 페이지 */}
          <Route element={<Layout />}>
            <Route path="/" element={<Main />} />
            <Route path="/classes/:classId" element={<ClassDetail />} />
            <Route
              path="/register"
              element={
                <ProtectedRoute>
                  <ClassRegister />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my"
              element={
                <ProtectedRoute>
                  <MyReservations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute>
                  <TeacherPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 헤더/푸터가 없는 페이지  */}
          <Route path="payments" element={<PaymentWidgetModal />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
