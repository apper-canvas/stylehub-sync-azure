import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/layouts/Root";
import ApperIcon from "@/components/ApperIcon";
import Shop from "@/components/pages/Shop";
import Home from "@/components/pages/Home";
import MobileMenu from "@/components/molecules/MobileMenu";
import SearchBar from "@/components/molecules/SearchBar";
import { selectCartItemsCount, toggleCart } from "@/store/slices/cartSlice";
import { selectWishlistItemsCount } from "@/store/slices/wishlistSlice";
const Header = () => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const cartItemsCount = useSelector(selectCartItemsCount)
  const wishlistItemsCount = useSelector(selectWishlistItemsCount)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const categories = [
    { name: "Women", path: "/shop?category=women" },
    { name: "Men", path: "/shop?category=men" },
    { name: "Accessories", path: "/shop?category=accessories" },
    { name: "Shoes", path: "/shop?category=shoes" },
  ]

  const handleCartClick = () => {
    dispatch(toggleCart())
  }

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query)}`)
      setIsSearchOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-md text-primary hover:bg-secondary transition-colors"
            >
              <ApperIcon name="Menu" size={24} />
            </button>
          </div>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
<h1 className="text-2xl font-display font-bold text-primary">
              Fashion<span className="text-accent">Hub</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-primary hover:text-accent transition-colors font-medium relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-250 group-hover:w-full"></span>
            </Link>
            
            <div className="relative group">
              <Link
                to="/shop"
                className="text-primary hover:text-accent transition-colors font-medium flex items-center gap-1"
              >
                Shop
                <ApperIcon name="ChevronDown" size={16} />
              </Link>
              
              <div className="absolute top-full left-0 mt-2 w-48 bg-surface rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-secondary">
                <div className="py-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="block px-4 py-2 text-sm text-primary hover:bg-secondary hover:text-accent transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              to="/shop?collection=featured"
              className="text-primary hover:text-accent transition-colors font-medium relative group"
            >
              Collections
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-250 group-hover:w-full"></span>
            </Link>
            
            <Link
              to="/shop?sale=true"
              className="text-primary hover:text-accent transition-colors font-medium relative group"
            >
              Sale
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-250 group-hover:w-full"></span>
            </Link>
          </nav>
{/* Search, Wishlist and Cart */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden p-2 rounded-md text-primary hover:bg-secondary transition-colors"
            >
              <ApperIcon name="Search" size={20} />
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2 rounded-md text-primary hover:bg-secondary transition-colors"
            >
              <ApperIcon name="Heart" size={20} />
{wishlistItemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-surface text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {wishlistItemsCount}
                </motion.span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              className="relative p-2 rounded-md text-primary hover:bg-secondary transition-colors"
            >
              <ApperIcon name="ShoppingBag" size={20} />
              {cartItemsCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-accent text-surface text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
                >
                  {cartItemsCount}
                </motion.span>
              )}
</button>

            {/* User Menu / Logout */}
            <UserMenu />
          </div>
</div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
      />

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              exit={{ y: -100 }}
              className="bg-surface p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4">
                <SearchBar onSearch={handleSearch} autoFocus />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-primary"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// User Menu Component
const UserMenu = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user)
  const { logout } = useAuth()
  const [showMenu, setShowMenu] = useState(false)

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="p-2 rounded-md text-primary hover:bg-secondary transition-colors"
      >
        <ApperIcon name="User" size={20} />
      </Link>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 rounded-md text-primary hover:bg-secondary transition-colors flex items-center gap-2"
      >
        <ApperIcon name="User" size={20} />
        <span className="hidden md:inline text-sm">
          {user?.firstName || user?.name || 'User'}
        </span>
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName || user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{user?.emailAddress || user?.email}</p>
            </div>
            <button
              onClick={() => {
                setShowMenu(false)
                logout()
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <ApperIcon name="LogOut" size={16} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Header