import {
  useState,
  useEffect,
  useContext
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
import routes from '@/routes'
import { TitleContext } from '@/context/useTitleContext';
import { LanguageContext } from '@/context/useLanguageContext';
import Dropdown from '@/component/dropdown';
import Popup from '@/component/popup';
import ReturnButton from '@/component/return_button';

export default function Root(props) {
  const { title, setTitle } = useContext(TitleContext)
  const [drawerHidden, setDrawerHidden] = useState(true)
  const {
    language, setLanguage,
    drawerTextDefaultLang,
    drawerAlternateLang,
    i18n
  } = useContext(LanguageContext)
  const [drawerDestinations, setDrawerDestinations] = useState(null)

  const toggleDrawer = () => {
    setDrawerHidden(!drawerHidden)
  }

  const renderDrawerDestinations = () => {
    return routes.filter((item) => item.inDrawer).map((item) => {
      if (typeof item.element.type === 'string') {
        return (
          <a key={item.name}
            href={item.path}
            target="_blank">
            <section>
              {i18n.key[item.name][drawerTextDefaultLang]}
            </section>
            <section>
              {i18n.key[item.name][drawerAlternateLang]}
            </section>
          </a>
        )
      } else {
        return (
          <NavLink to={item.path} key={item.name}>
            <section>
              {i18n.key[item.name][drawerTextDefaultLang]}
            </section>
            <section>
              {i18n.key[item.name][drawerAlternateLang]}
            </section>
          </NavLink>
        )
      }
    })
  }

  useEffect(() => {
    setDrawerDestinations(renderDrawerDestinations())
  }, [drawerAlternateLang])

  return (
    <>
      <header className='header'>
        <section
          className={`navButton ${drawerHidden ? '' : 'active'}`}
          onClick={() => toggleDrawer()}
        >
          <section className='bar'></section>
          <section className='bar'></section>
          <section className='bar'></section>
        </section>
        <Dropdown 
          text={i18n.key[language][language]}
          menu={i18n.available.map((item) => {
            return {
              name: i18n.key[item][language],
              value: item
            }
          })}
          onClick={(item) => {
            setLanguage(item.value)
          }}
        />
      </header>
      <nav className={`drawer ${drawerHidden ? '' : 'active'}`}>
        <section
          className='links'
        >
          {drawerDestinations}
        </section>
        <section
          className={`overlay ${drawerHidden ? '' : 'active'}`}
          onClick={() => toggleDrawer()}
        />
      </nav>
      <main className='main'>
        <section>
          <section>{title}</section>
          <section>
            {/* <NavLink to="/home">All</NavLink>
                    <NavLink to="/about">Operator</NavLink>
                    <NavLink to="/contact">Skill</NavLink> */}
          </section>
        </section>
        <Outlet />
      </main>
      <footer className='footer'>
        <section className='links section'>
          <a href="https://privacy.halyul.dev" target="_blank" className='item'>{i18n.key.privacy_policy[language]}</a>
          <span className='separator' />
          <a href="https://github.com/Halyul/aklive2d" target="_blank" className='item'>Github</a>
          <span className='separator'/>
          <Popup 
            className='item'
            title={i18n.key.contact_us[language]}
          >
            ak#halyul.dev
          </Popup>
        </section>
        <section className='copyright section'>
          <span>Spine Runtimes © 2013 - 2019, Esoteric Software LLC</span>
          <span>Assets © 2017 - 2023 上海鹰角网络科技有限公司</span>
          <span>Source Code © 2021 - 2023 Halyul</span>
        </section>
      </footer>
    </>
  )
}
