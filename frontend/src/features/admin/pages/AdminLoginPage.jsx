import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../../../api/http.js";
import { useAuth } from "../../../context/AuthContext.jsx";
import "../styles/admin.css"; // ถ้ามีไฟล์ css ของ admin login

const DEMO_ADMIN_EMAIL = "admin01@unieed.com";
const DEMO_ADMIN_PASSWORD = "admin1234";

function maskEmail(email) {
  const [localPart, domain = ""] = email.split("@");
  const visibleStart = localPart.slice(0, 2);
  const visibleEnd = localPart.slice(-1);
  const hiddenLength = Math.max(localPart.length - 3, 1);

  return `${visibleStart}${"*".repeat(hiddenLength)}${visibleEnd}@${domain}`;
}

export default function AdminLoginPage() {
  const [user_email] = useState(DEMO_ADMIN_EMAIL);
  const [password] = useState(DEMO_ADMIN_PASSWORD);
  const [err, setErr] = useState(""); // ✅ เพิ่ม err

  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: { user_email, password },
        auth: false,
      });

      if (data.role !== "admin") {
        setErr("บัญชีนี้ไม่ใช่ผู้ดูแลระบบ");
        return;
      }

      // ✅ ส่งให้ตรงกับ AuthContext: login({token, role, user_name})
      login({ token: data.token, role: data.role, user_name: data.user_name, user_email: data.user_email });

      navigate("/admin/backoffice", { replace: true });
    } catch (e) {
      setErr(e?.data?.message || e.message || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div className="adLgPage">
  <div className="adLgCard">
    <div className="adLgHeader">
      <h2 className="adLgTitle">Admin Login</h2>
      <p className="adLgSubtitle">เข้าสู่ระบบสำหรับผู้ดูแลระบบ</p>
    </div>

    {err && <div className="adLgAlert">{err}</div>}

    <form className="adLgForm" onSubmit={submit}>
      <div className="adLgField">
        <label className="adLgLabel">อีเมล</label>
        <input
          className="adLgInput"
          value={maskEmail(user_email)}
          type="text"
          readOnly
          aria-label="อีเมลผู้ดูแลระบบ (ปิดบังบางส่วน)"
          autoComplete="off"
        />
      </div>

      <div className="adLgField">
        <label className="adLgLabel">รหัสผ่าน</label>
        <input
          className="adLgInput"
          value={password}
          placeholder="••••••••"
          type="password"
          readOnly
          aria-label="รหัสผ่านผู้ดูแลระบบ"
          autoComplete="off"
        />
      </div>

      <button className="adLgBtn" type="submit">
        เข้าสู่ระบบ
      </button>
    </form>
  </div>
</div>

  );
}
