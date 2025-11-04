import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import { orderService } from '@/services/api/orderService'
import { toast } from 'react-toastify'

function OrderHistory() {
  const { user, isAuthenticated } = useSelector(state => state.user)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (isAuthenticated && user?.emailAddress) {
      loadUserOrders()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const loadUserOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const userOrders = await orderService.getUserOrders(user.emailAddress)
      setOrders(userOrders)
    } catch (err) {
      console.error('Error loading user orders:', err)
      setError('Failed to load your orders. Please try again.')
      toast.error('Failed to load your orders')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'text-yellow-600 bg-yellow-100'
      case 'shipped': return 'text-blue-600 bg-blue-100'
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'Clock'
      case 'shipped': return 'Truck'
      case 'delivered': return 'CheckCircle'
      case 'cancelled': return 'XCircle'
      default: return 'Package'
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.items.some(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <ApperIcon name="Lock" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-600 mb-6">
              You need to sign in to view your order history.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadUserOrders} />

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Order History
          </h1>
          <p className="text-gray-600">
            Track and manage all your orders
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order number or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <ApperIcon name="Filter" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Orders</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Empty 
            title="No orders found"
            message={searchQuery || statusFilter !== 'all' ? 
              "Try adjusting your search or filter criteria." : 
              "You haven't placed any orders yet."
            }
            action={
              <Link 
                to="/shop" 
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
              >
                <ApperIcon name="ShoppingBag" className="w-5 h-5 mr-2" />
                Start Shopping
              </Link>
            }
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {order.orderNumber}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          <ApperIcon name={getStatusIcon(order.status)} className="w-3 h-3 mr-1" />
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-2" />
                          {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <ApperIcon name="Package" className="w-4 h-4 mr-2" />
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                        </div>
                        <div className="flex items-center">
                          <ApperIcon name="DollarSign" className="w-4 h-4 mr-2" />
                          ${order.total?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/orders/${order.Id}`}
                        className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        <ApperIcon name="Eye" className="w-4 h-4 mr-2" />
                        Track Order
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 overflow-x-auto">
                        {order.items.slice(0, 3).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                              <ApperIcon name="Package" className="w-4 h-4" />
                            </div>
                            <span>{item.name}</span>
                            <span className="text-gray-400">×{item.quantity}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-gray-500">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default OrderHistory