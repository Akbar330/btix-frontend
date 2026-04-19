import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from './Chatbot';

export default function MainLayout() {
    return (
        <div className="font-sans min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
            <Navbar />
            <Outlet />
            <Footer />
            <Chatbot />
        </div>
    );
}
