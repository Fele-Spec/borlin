import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import AvatarCustomizer from "@/components/AvatarCustomizer";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/avatar" element={<AvatarCustomizer />} />
        <Route path="*" element={<div className="flex h-screen items-center justify-center text-text-primary">页面不存在</div>} />
      </Routes>
    </Router>
  );
}
