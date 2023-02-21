import {
  useState,
  useEffect
} from 'react'
import {
  Outlet,
  Link,
  NavLink,
  useNavigation,
  useLocation,
  useNavigate,
} from "react-router-dom";
import './root.css'

export default function Root(props) {
  return (
    <>
      <header>
        <section>Nav button</section>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/operator/chen">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>
      <main className='main'>
        <section>
          <section>Dynamic Compile</section>
          <section>
            {/* <NavLink to="/home">All</NavLink>
                    <NavLink to="/about">Operator</NavLink>
                    <NavLink to="/contact">Skill</NavLink> */}
          </section>
        </section>
        <Outlet />
      </main>
      <footer>
        <section>
          <p>Privacy Policy</p>
          <p>Github</p>
          <p>Contact Us</p>
        </section>
        <section>
          <p>Spine Runtimes © 2013 - 2019, Esoteric Software LLC</p>
          <p>Assets © 2017 - 2023 上海鹰角网络科技有限公司</p>
          <p>Source Code © 2021 - 2023 Halyul</p>
        </section>
      </footer>
    </>
  )
}
