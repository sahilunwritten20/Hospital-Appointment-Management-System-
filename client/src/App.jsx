import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Modal from './components/Modal.jsx';
import Toast from './components/Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Book from './pages/Book.jsx';
import Doctors from './pages/Doctors.jsx';
import Appointments from './pages/Appointments.jsx';

function Views() {
  const { view } = useApp();
  switch (view) {
    case 'book':
      return <Book />;
    case 'doctors':
      return <Doctors />;
    case 'appointments':
      return <Appointments />;
    case 'dashboard':
    default:
      return <Dashboard />;
  }
}

function Shell() {
  return (
    <>
      <Header />
      <main>
        <Views />
      </main>
      <Footer />
      <Modal />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
