import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

export const orderService = {
  // Get orders for a specific user
  async getUserOrders(userEmail) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('order_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "delivered_at_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "shipping_address_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "shipping_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "estimated_delivery_c"}}
        ],
        where: [{
          "FieldName": "user_email_c",
          "Operator": "EqualTo",
          "Values": [userEmail]
        }],
        orderBy: [{
          "fieldName": "created_at_c",
          "sorttype": "DESC"
        }]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      // Transform data to match UI expectations
      return response.data.map(order => ({
        Id: order.Id,
        createdAt: order.created_at_c,
        deliveredAt: order.delivered_at_c,
        items: JSON.parse(order.items_c || '[]'),
        orderNumber: order.order_number_c,
        paymentMethod: order.payment_method_c,
        shippingAddress: JSON.parse(order.shipping_address_c || '{}'),
        status: order.status_c,
        total: order.total_c,
        userEmail: order.user_email_c,
        subtotal: order.subtotal_c,
        shipping: order.shipping_c,
        tax: order.tax_c,
        estimatedDelivery: order.estimated_delivery_c
      }))
    } catch (error) {
      console.error("Error fetching user orders:", error?.response?.data?.message || error)
      return []
    }
  },

  // Get order by ID
  async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('order_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "delivered_at_c"}},
          {"field": {"Name": "items_c"}},
          {"field": {"Name": "order_number_c"}},
          {"field": {"Name": "payment_method_c"}},
          {"field": {"Name": "shipping_address_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "total_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "subtotal_c"}},
          {"field": {"Name": "shipping_c"}},
          {"field": {"Name": "tax_c"}},
          {"field": {"Name": "estimated_delivery_c"}}
        ]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Order not found")
      }
      
      const order = response.data
      return {
        Id: order.Id,
        createdAt: order.created_at_c,
        deliveredAt: order.delivered_at_c,
        items: JSON.parse(order.items_c || '[]'),
        orderNumber: order.order_number_c,
        paymentMethod: order.payment_method_c,
        shippingAddress: JSON.parse(order.shipping_address_c || '{}'),
        status: order.status_c,
        total: order.total_c,
        userEmail: order.user_email_c,
        subtotal: order.subtotal_c,
        shipping: order.shipping_c,
        tax: order.tax_c,
        estimatedDelivery: order.estimated_delivery_c
      }
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error?.response?.data?.message || error)
      throw new Error("Order not found")
    }
  },

  // Create new order
  async create(orderData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.createRecord('order_c', {
        records: [{
          created_at_c: new Date().toISOString(),
          items_c: JSON.stringify(orderData.items),
          order_number_c: `ORDER-${Date.now()}`,
          payment_method_c: orderData.paymentMethod,
          shipping_address_c: JSON.stringify(orderData.shippingAddress),
          status_c: "processing",
          total_c: orderData.total,
          user_email_c: orderData.shippingAddress.email,
          subtotal_c: orderData.subtotal,
          shipping_c: orderData.shipping,
          tax_c: orderData.tax,
          estimated_delivery_c: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to create order")
      }
      
      const createdOrder = response.results[0].data
      return {
        Id: createdOrder.Id,
        createdAt: createdOrder.created_at_c,
        deliveredAt: createdOrder.delivered_at_c,
        items: JSON.parse(createdOrder.items_c || '[]'),
        orderNumber: createdOrder.order_number_c,
        paymentMethod: createdOrder.payment_method_c,
        shippingAddress: JSON.parse(createdOrder.shipping_address_c || '{}'),
        status: createdOrder.status_c,
        total: createdOrder.total_c,
        userEmail: createdOrder.user_email_c,
        subtotal: createdOrder.subtotal_c,
        shipping: createdOrder.shipping_c,
        tax: createdOrder.tax_c,
        estimatedDelivery: createdOrder.estimated_delivery_c
      }
    } catch (error) {
      console.error("Error creating order:", error?.response?.data?.message || error)
      throw new Error("Failed to create order")
    }
  },

  // Check if user has purchased a product
  async hasPurchased(userEmail, productId) {
    try {
      const userOrders = await this.getUserOrders(userEmail)
      return userOrders.some(order => 
        order.items.some(item => item.productId === parseInt(productId))
      )
    } catch (error) {
      console.error("Error checking purchase history:", error?.response?.data?.message || error)
      return false
    }
  }
}