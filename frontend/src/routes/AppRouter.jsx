import { BrowserRouter, Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import Products from "../pages/Products/Products";
import Tracking from "../pages/Tracking/Tracking";

import Home from "../pages/Home/Home";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/seguimiento" element={<Tracking />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;