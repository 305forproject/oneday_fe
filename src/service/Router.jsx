import { BrowserRouter, Routes, Route } from "react-router-dom";

// 레이아웃
import Layout from "../features/layout/Layout";

// 페이지 컴포넌트
import Main from "../pages/MainPage";
// import Login from "../pages/Login";
// import ClassDetail from "../pages/ClassDetail";
// import MyPage from "../pages/MyPage";

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 헤더/푸터가 필요한 페이지 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Main />} />
          {/* <Route path="/classes/:classId" element={<ClassDetail />} /> */}
          {/* <Route path="/my" element={<MyPage />} /> */}
        </Route>

        {/* 헤더/푸터가 없는 페이지  */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
