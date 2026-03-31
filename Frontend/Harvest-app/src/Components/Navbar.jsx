import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-white border-b border-emerald-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative">
                
                {/* Logo - Farm Theme */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                        🌾
                    </div>
                    <Link 
                        to="/" 
                        className="text-3xl font-bold text-emerald-800 tracking-tight hover:text-emerald-700 transition-colors"
                    >
                        HarvestHub
                    </Link>
                </div>

                {/* Hamburger Menu Icon - Farm Colors */}
                <div 
                    className="md:hidden cursor-pointer p-2 text-emerald-700 hover:text-emerald-800 transition-colors"
                    onClick={toggleMenu}
                >
                    {isOpen ? (
                        <X className="w-7 h-7" />
                    ) : (
                        <Menu className="w-7 h-7" />
                    )}
                </div>

                {/* Menu Links - Desktop & Mobile */}
                <ul
                    className={`flex flex-col md:flex-row md:items-center md:space-x-8 absolute md:static bg-white md:bg-transparent w-full md:w-auto left-0 md:left-auto top-16 md:top-auto p-6 md:p-0 shadow-xl md:shadow-none border-t border-emerald-100 md:border-none transition-all duration-300 ease-in-out ${
                        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'
                    }`}
                >
                    <li className="py-3 md:py-0">
                        <Link 
                            to="/" 
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-medium text-stone-700 hover:text-emerald-700 transition-colors block"
                        >
                            Home
                        </Link>
                    </li>
                    <li className="py-3 md:py-0">
                        <Link 
                            to="/about" 
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-medium text-stone-700 hover:text-emerald-700 transition-colors block"
                        >
                            About
                        </Link>
                    </li>
                    <li className="py-3 md:py-0">
                        <Link 
                            to="/contact" 
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-medium text-stone-700 hover:text-emerald-700 transition-colors block"
                        >
                            Contact
                        </Link>
                    </li>

                    {/* Action Buttons - Mobile Stack + Desktop Side-by-side */}
                    <div className="flex flex-col md:flex-row gap-3 pt-6 md:pt-0 md:ml-8 border-t border-emerald-100 md:border-none">
                        <Link 
                            to="/Login"
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-3 text-center text-emerald-700 font-semibold hover:bg-emerald-100 rounded-2xl transition-all"
                        >
                            Log in
                        </Link>
                        <Link 
                            to="/Login"
                            onClick={() => setIsOpen(false)}
                            className="px-6 py-3 text-center bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl transition-all shadow-md"
                        >
                            Start Free Trial
                        </Link>
                    </div>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;