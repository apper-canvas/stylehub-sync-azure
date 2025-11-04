import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { format, differenceInDays } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import { orderService } from '@/services/api/orderService'
import { toast } from 'react-toastify'

function OrderTracking() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector(state => state.user)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && id) {
      loadOrder()
    } else if (!isAuthenticated) {
      navigate('/login')
    } else {
      setLoading(false)
    }
  }, [id, isAuthenticated, navigate])

  const loadOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      const orderData = await orderService.getById(id)
      
      // Verify this order belongs to the current user
      if (orderData.userEmail !== user?.emailAddress) {
        setError('Order not found or you do not have permission to view this order.')
        return
      }
      
      setOrder(orderData)
    } catch (err) {
      console.error('Error loading order:', err)
      setError('Order not found. Please check the order number and try again.')
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'processing': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'shipped': return 'text-blue-600 bg-blue-100 border-blue-200'
      case 'delivered': return 'text-green-600 bg-green-100 border-green-200'
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTrackingSteps = (status, createdAt, deliveredAt, estimatedDelivery) => {
    const steps = [
      { key: 'processing', label: 'Order Processing', icon: 'Clock' },
      { key: 'shipped', label: 'Shipped', icon: 'Truck' },
      { key: 'delivered', label: 'Delivered', icon: 'CheckCircle' }
    ]

    const statusOrder = ['processing', 'shipped', 'delivered']
    const currentStatusIndex = statusOrder.indexOf(status?.toLowerCase())

    return steps.map((step, index) => {
      let stepStatus = 'pending'
      let stepDate = null

      if (index < currentStatusIndex || (index === currentStatusIndex && status !== 'cancelled')) {
        stepStatus = 'completed'
      } else if (index === currentStatusIndex) {
        stepStatus = 'current'
      }

      // Set dates based on status
      if (step.key === 'processing' && createdAt) {
        stepDate = createdAt
      } else if (step.key === 'delivered' && deliveredAt) {
        stepDate = deliveredAt
      } else if (step.key === 'shipped' && status === 'shipped' && !deliveredAt) {
        stepDate = createdAt // Use creation date as approximate ship date
      }

      return { ...step, status: stepStatus, date: stepDate }
    })
  }

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
              You need to sign in to track your orders.
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
  if (error) return (
    <Error 
      message={error} 
      onRetry={loadOrder}
      action={
        <Link 
          to="/orders" 
          className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors mt-4"
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
      }
    />
  )

  if (!order) return <Loading />

  const trackingSteps = getTrackingSteps(order.status, order.createdAt, order.deliveredAt, order.estimatedDelivery)
  const daysUntilDelivery = order.estimatedDelivery ? differenceInDays(new Date(order.estimatedDelivery), new Date()) : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/orders" 
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="ArrowLeft" className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Order Tracking
              </h1>
              <p className="text-gray-600">
                {order.orderNumber}
              </p>
            </div>
          </div>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getStatusColor(order.status)}`}>
            <ApperIcon name="Package" className="w-4 h-4 mr-2" />
            <span className="font-medium capitalize">
              {order.status}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tracking Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Delivery Progress
              </h2>
              
              {daysUntilDelivery !== null && daysUntilDelivery > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <ApperIcon name="Clock" className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">
                      Estimated delivery in {daysUntilDelivery} {daysUntilDelivery === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <p className="text-blue-700 mt-1 text-sm">
                      Expected by {format(new Date(order.estimatedDelivery), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-8">
                {trackingSteps.map((step, index) => (
                  <div key={step.key} className="flex items-start">
                    <div className="flex flex-col items-center mr-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        <ApperIcon name={step.icon} className="w-5 h-5" />
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div className={`w-0.5 h-8 mt-2 ${
                          step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${
                          step.status === 'completed' ? 'text-green-800' :
                          step.status === 'current' ? 'text-blue-800' :
                          'text-gray-500'
                        }`}>
                          {step.label}
                        </h3>
                        {step.date && (
                          <span className="text-sm text-gray-500">
                            {format(new Date(step.date), 'MMM dd, h:mm a')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">
                        {step.status === 'completed' ? 'Completed' :
                         step.status === 'current' ? 'In Progress' :
                         'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      <ApperIcon name="Package" className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Quantity: {item.quantity}</span>
                        <span>Price: ${item.price?.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">${order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-gray-900">${order.shipping?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="text-gray-900">${order.tax?.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>${order.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Shipping Address
              </h3>
              {order.shippingAddress && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Method
              </h3>
              <div className="flex items-center">
                <ApperIcon name="CreditCard" className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900 capitalize">{order.paymentMethod}</span>
              </div>
            </motion.div>

            {/* Order Date */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Date
              </h3>
              <div className="flex items-center">
                <ApperIcon name="Calendar" className="w-5 h-5 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy h:mm a')}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking