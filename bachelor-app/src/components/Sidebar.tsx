import React, { useState } from "react";
import '../Sidebar.css';
import { FaBars } from 'react-icons/fa';
import { Link } from "react-router-dom";
import { IconContext } from 'react-icons';
import { AiOutlineClose } from 'react-icons/ai';
import { DataType } from "./DataContext/MasterDataType";

export interface DataFilter{
    title: string,
    dataType: keyof DataType,
}

interface SidebarData {
  Data: DataFilter[],
  SelectedFilter: (dataType: keyof DataType) => void,
  iconColor: string,
}


function SidebarC({ Data, SelectedFilter, iconColor }: SidebarData) {
  const [sidebar, setSidebar] = useState(false);

  const showSidebar = () => {
    setSidebar(!sidebar);
  }

  return (
    <>
      <IconContext.Provider value={{}}>
        <div>
          {sidebar ? <></> :
            <Link to='#' className='menu-bars hamburger-icon'>
              <FaBars onClick={showSidebar} color={iconColor} />
            </Link>
          }
        </div>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
          <ul className='nav-menu-items' onClick={showSidebar}>
            <li className='navbar-toggle'>
              <Link to='#' className='menu-bars close'>
                <AiOutlineClose />
              </Link>
            </li>
            {Data.map((item, index) => {
              return (
                <li key={index} className="nav-text">
                  <Link to="#" >
                    <span onClick={() => SelectedFilter(item.dataType)}>{item.title}</span>
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