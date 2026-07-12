import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import "./styles/Footer.css";

export default function Footer() {
  const scrollTop = () => window.scrollTo(0, 0);

  return (
    <footer id="about" className="footer">
      <div className="footerInner">
        <div className="footBrand">
          <div>
            <Link to="/" onClick={scrollTop}>
              <img className="footLogo" src="/unieed_pic/logo.png" alt="Unieed" />
            </Link>
            <div className="footDesc">
              แพลตฟอร์มส่งต่อแบ่งปันชุดนักเรียน
              <br />
              เพื่อมอบโอกาสทางการศึกษาให้กับนักเรียน
            </div>
          </div>
        </div>

        <div className="footCol">
          <div className="footTitle">เมนูลัด</div>
          <Link to="/" onClick={scrollTop}>หน้าหลัก</Link>
          <Link to="/projects">โครงการ</Link>
          <Link to="/market">ร้านค้า</Link>
          <Link to="/sell">ลงขาย</Link>
          <Link to="/about">เกี่ยวกับเรา</Link>
          <Link to="/manual">คู่มือการใช้</Link>
        </div>

        <div className="footCol">
          <div className="footTitle">ติดต่อเรา</div>
          <div className="footerContactItem">
            <Icon icon="mdi:phone-outline" />
            <div className="contactfooter">062-379-0000</div>
          </div>
          <div className="footerContactItem">
            <Icon icon="mdi:email-outline" />
            <div className="contactfooter">contact@unieed.com</div>
          </div>
          <div className="connect" aria-label="ช่องทางโซเชียล">
            <Icon icon="mdi:facebook" />
            <Icon icon="simple-icons:line" />
          </div>
        </div>
      </div>
    </footer>
  );
}
