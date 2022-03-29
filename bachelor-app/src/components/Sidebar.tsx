import React, { useState } from "react";
import '../Sidebar.css';
import { FaBars } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { IconContext } from 'react-icons';
import * as AiIcons from 'react-icons/ai';

interface SidebarData {
 title: string,
 path: string,
 cName: string
}

function SidebarC({Data, iconColor}: {Data: SidebarData[], iconColor: string}) {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => {
    setSidebar(!sidebar);
  }

  return (
    <>
      <IconContext.Provider value={{ }}>
        <div>
          <Link to='#' className='menu-bars hamburger-icon'>
            <FaBars onClick={showSidebar} color={iconColor}/>
          </Link>
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars close'>
                <AiIcons.AiOutlineClose />
              </Link>
            </li>
            {Data.map((item, index) => {
              return (
                <li key={index} className={item.cName}>
                  <Link to={item.path}>
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </IconContext.Provider>
    </>
  );
}

export default SidebarC;