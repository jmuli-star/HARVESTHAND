import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';   // ← THIS WAS MISSING

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center relative">   {/* relative added for proper mobile positioning */}
                
                {/* Logo */}
                <div className="text-2xl font-bold">
                    <Link to="/">Home</Link>
                </div>

                {/* Hamburger Menu Icon */}
                <div 
                    className="md:hidden cursor-pointer p-1"
                    onClick={toggleMenu}
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </div>

                {/* Menu Links */}
                <ul
                    className={`flex flex-col md:flex-row md:space-x-6 absolute md:static bg-blue-600 md:bg-transparent w-full md:w-auto left-0 p-6 md:p-0 transition-all duration-300 ease-in-out shadow-lg md:shadow-none ${
                        isOpen ? 'top-16' : '-top-96'
                    }`}
                >
                    <li className="py-2 md:py-0">
                        <Link 
                            to="/" 
                            onClick={() => setIsOpen(false)}
                            className="hover:text-blue-200 transition-colors"
                        >
                            Home
                        </Link>
                    </li>
                    <li className="py-2 md:py-0">
                        <Link 
                            to="/about" 
                            onClick={() => setIsOpen(false)}
                            className="hover:text-blue-200 transition-colors"
                        >
                            About
                        </Link>
                    </li>
                    <li className="py-2 md:py-0">
                        <Link 
                            to="/contact" 
                            onClick={() => setIsOpen(false)}
                            className="hover:text-blue-200 transition-colors"
                        >
                            Contact
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;