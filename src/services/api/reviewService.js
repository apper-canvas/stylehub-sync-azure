import { getApperClient } from "@/services/apperClient"
import { toast } from "react-toastify"

export const reviewService = {
  // Get all reviews for a product
  async getByProductId(productId) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('review_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "comment_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "verified_c"}},
          {"field": {"Name": "product_id_c"}}
        ],
        where: [{
          "FieldName": "product_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(productId)]
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
      
      return response.data.map(review => ({
        Id: review.Id,
        comment: review.comment_c,
        createdAt: review.created_at_c,
        productId: review.product_id_c?.Id || review.product_id_c,
        rating: review.rating_c,
        userEmail: review.user_email_c,
        userName: review.user_name_c,
        verified: review.verified_c
      }))
    } catch (error) {
      console.error("Error fetching product reviews:", error?.response?.data?.message || error)
      return []
    }
  },

  // Get reviews by user
  async getByUser(userEmail) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('review_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "comment_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "user_email_c"}},
          {"field": {"Name": "user_name_c"}},
          {"field": {"Name": "verified_c"}},
          {"field": {"Name": "product_id_c"}}
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
      
      return response.data.map(review => ({
        Id: review.Id,
        comment: review.comment_c,
        createdAt: review.created_at_c,
        productId: review.product_id_c?.Id || review.product_id_c,
        rating: review.rating_c,
        userEmail: review.user_email_c,
        userName: review.user_name_c,
        verified: review.verified_c
      }))
    } catch (error) {
      console.error("Error fetching user reviews:", error?.response?.data?.message || error)
      return []
    }
  },

  // Create new review
  async create(reviewData) {
    try {
      // Validate required fields
      if (!reviewData.productId || !reviewData.rating || !reviewData.userEmail) {
        throw new Error("Missing required fields")
      }
      
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error("Rating must be between 1 and 5")
      }

      // Check if user already reviewed this product
      const existingReviews = await this.getByUser(reviewData.userEmail)
      const existingReview = existingReviews.find(r => 
        r.productId === parseInt(reviewData.productId)
      )
      
      if (existingReview) {
        throw new Error("You have already reviewed this product")
      }

      const apperClient = getApperClient()
      const response = await apperClient.createRecord('review_c', {
        records: [{
          comment_c: reviewData.comment?.trim() || "",
          created_at_c: new Date().toISOString(),
          rating_c: parseInt(reviewData.rating),
          user_email_c: reviewData.userEmail,
          user_name_c: reviewData.userName || "Anonymous",
          verified_c: true,
          product_id_c: parseInt(reviewData.productId)
        }]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Failed to create review")
      }
      
      const createdReview = response.results[0].data
      return {
        Id: createdReview.Id,
        comment: createdReview.comment_c,
        createdAt: createdReview.created_at_c,
        productId: createdReview.product_id_c,
        rating: createdReview.rating_c,
        userEmail: createdReview.user_email_c,
        userName: createdReview.user_name_c,
        verified: createdReview.verified_c
      }
    } catch (error) {
      console.error("Error creating review:", error?.response?.data?.message || error)
      throw error
    }
  },

  // Update existing review
  async update(id, updateData) {
    try {
      if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
        throw new Error("Rating must be between 1 and 5")
      }

      const apperClient = getApperClient()
      const updateRecord = {
        Id: parseInt(id)
      }
      
      if (updateData.rating !== undefined) {
        updateRecord.rating_c = parseInt(updateData.rating)
      }
      if (updateData.comment !== undefined) {
        updateRecord.comment_c = updateData.comment?.trim()
      }
      
      const response = await apperClient.updateRecord('review_c', {
        records: [updateRecord]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Review not found")
      }
      
      const updatedReview = response.results[0].data
      return {
        Id: updatedReview.Id,
        comment: updatedReview.comment_c,
        createdAt: updatedReview.created_at_c,
        productId: updatedReview.product_id_c,
        rating: updatedReview.rating_c,
        userEmail: updatedReview.user_email_c,
        userName: updatedReview.user_name_c,
        verified: updatedReview.verified_c,
        updatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error(`Error updating review ${id}:`, error?.response?.data?.message || error)
      throw error
    }
  },

  // Delete review
  async delete(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.deleteRecord('review_c', {
        RecordIds: [parseInt(id)]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Review not found")
      }
      
      return response.results[0].success
    } catch (error) {
      console.error(`Error deleting review ${id}:`, error?.response?.data?.message || error)
      throw new Error("Review not found")
    }
  },

  // Get review statistics for a product
  async getProductStats(productId) {
    try {
      const productReviews = await this.getByProductId(productId)

      if (productReviews.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        }
      }

      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / productReviews.length

      const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      productReviews.forEach(review => {
        ratingBreakdown[review.rating]++
      })

      return {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews: productReviews.length,
        ratingBreakdown
      }
    } catch (error) {
      console.error(`Error fetching product stats for ${productId}:`, error?.response?.data?.message || error)
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    }
  }
}