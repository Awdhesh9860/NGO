import React from 'react';
import { Header, HeaderProps } from '../navigation/Header';

export type NavbarProps = HeaderProps;

export const Navbar: React.FC<NavbarProps> = (props) => {
  return <Header {...props} />;
};

export default Navbar;
