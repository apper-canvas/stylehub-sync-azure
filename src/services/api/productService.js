import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

export const productService = {
  async getAll(filters = {}) {
    try {
      const apperClient = getApperClient()
      
      // Build where conditions based on filters
      const whereConditions = []
      
      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        whereConditions.push({
          "FieldName": "category_c",
          "Operator": "Contains",
          "Values": filters.categories
        })
      }
      
      // Apply search filter
      if (filters.search) {
        whereConditions.push({
          "FieldName": "name_c",
          "Operator": "Contains",
          "Values": [filters.search]
        })
      }
      
      // Apply price range filter
      if (filters.minPrice !== undefined) {
        whereConditions.push({
          "FieldName": "price_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [filters.minPrice]
        })
      }
      
      if (filters.maxPrice !== undefined) {
        whereConditions.push({
          "FieldName": "price_c",
          "Operator": "LessThanOrEqualTo",
          "Values": [filters.maxPrice]
        })
      }
      
      // Apply sale filter
      if (filters.sale) {
        whereConditions.push({
          "FieldName": "original_price_c",
          "Operator": "GreaterThan",
          "Values": ["price_c"]
        })
      }
      
      // Build order by
      let orderBy = []
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case "price-low":
            orderBy = [{"fieldName": "price_c", "sorttype": "ASC"}]
            break
          case "price-high":
            orderBy = [{"fieldName": "price_c", "sorttype": "DESC"}]
            break
          case "name":
            orderBy = [{"fieldName": "name_c", "sorttype": "ASC"}]
            break
          case "rating":
            orderBy = [{"fieldName": "rating_c", "sorttype": "DESC"}]
            break
          case "newest":
            orderBy = [{"fieldName": "created_at_c", "sorttype": "DESC"}]
            break
        }
      }
      
      const response = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "featured_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "sizes_c"}}
        ],
        where: whereConditions,
        orderBy: orderBy
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      // Transform data to match UI expectations
      let products = response.data.map(product => ({
        Id: product.Id,
        name: product.name_c,
        category: product.category_c,
        colors: JSON.parse(product.colors_c || '[]'),
        createdAt: product.created_at_c,
        description: product.description_c,
        featured: product.featured_c,
        originalPrice: product.original_price_c,
        price: product.price_c,
        rating: product.rating_c,
        stock: product.stock_c,
        images: JSON.parse(product.images_c || '[]'),
        sizes: JSON.parse(product.sizes_c || '[]'),
        reviews: [] // Will be populated from reviews service
      }))
      
      // Apply client-side filters that are complex for database
      if (filters.sizes && filters.sizes.length > 0) {
        products = products.filter(product =>
          product.sizes && product.sizes.some(size => filters.sizes.includes(size))
        )
      }
      
      if (filters.colors && filters.colors.length > 0) {
        products = products.filter(product =>
          product.colors && product.colors.some(color => filters.colors.includes(color.name))
        )
      }
      
      return products
    } catch (error) {
      console.error("Error fetching products:", error?.response?.data?.message || error)
      return []
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('product_c', parseInt(id), {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "featured_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "sizes_c"}}
        ]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        throw new Error("Product not found")
      }
      
      const product = response.data
      return {
        Id: product.Id,
        name: product.name_c,
        category: product.category_c,
        colors: JSON.parse(product.colors_c || '[]'),
        createdAt: product.created_at_c,
        description: product.description_c,
        featured: product.featured_c,
        originalPrice: product.original_price_c,
        price: product.price_c,
        rating: product.rating_c,
        stock: product.stock_c,
        images: JSON.parse(product.images_c || '[]'),
        sizes: JSON.parse(product.sizes_c || '[]'),
        reviews: []
      }
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error?.response?.data?.message || error)
      throw new Error("Product not found")
    }
  },

  async getFeatured() {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "featured_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "sizes_c"}}
        ],
        where: [{
          "FieldName": "featured_c",
          "Operator": "EqualTo",
          "Values": [true]
        }],
        pagingInfo: {
          "limit": 8,
          "offset": 0
        }
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data.map(product => ({
        Id: product.Id,
        name: product.name_c,
        category: product.category_c,
        colors: JSON.parse(product.colors_c || '[]'),
        createdAt: product.created_at_c,
        description: product.description_c,
        featured: product.featured_c,
        originalPrice: product.original_price_c,
        price: product.price_c,
        rating: product.rating_c,
        stock: product.stock_c,
        images: JSON.parse(product.images_c || '[]'),
        sizes: JSON.parse(product.sizes_c || '[]'),
        reviews: []
      }))
    } catch (error) {
      console.error("Error fetching featured products:", error?.response?.data?.message || error)
      return []
    }
  },

  async getByCategory(category) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "featured_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "sizes_c"}}
        ],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [category]
        }]
      })
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data.map(product => ({
        Id: product.Id,
        name: product.name_c,
        category: product.category_c,
        colors: JSON.parse(product.colors_c || '[]'),
        createdAt: product.created_at_c,
        description: product.description_c,
        featured: product.featured_c,
        originalPrice: product.original_price_c,
        price: product.price_c,
        rating: product.rating_c,
        stock: product.stock_c,
        images: JSON.parse(product.images_c || '[]'),
        sizes: JSON.parse(product.sizes_c || '[]'),
        reviews: []
      }))
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error?.response?.data?.message || error)
      return []
    }
  },

  async getRelated(productId, limit = 4) {
    try {
      const currentProduct = await this.getById(productId)
      if (!currentProduct) return []
      
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('product_c', {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "colors_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "featured_c"}},
          {"field": {"Name": "original_price_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "rating_c"}},
          {"field": {"Name": "stock_c"}},
          {"field": {"Name": "images_c"}},
          {"field": {"Name": "sizes_c"}}
        ],
        where: [{
          "FieldName": "category_c",
          "Operator": "EqualTo",
          "Values": [currentProduct.category]
        }],
        pagingInfo: {
          "limit": limit + 1,
          "offset": 0
        }
      })
      
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data
        .filter(product => product.Id !== parseInt(productId))
        .slice(0, limit)
        .map(product => ({
          Id: product.Id,
          name: product.name_c,
          category: product.category_c,
          colors: JSON.parse(product.colors_c || '[]'),
          createdAt: product.created_at_c,
          description: product.description_c,
          featured: product.featured_c,
          originalPrice: product.original_price_c,
          price: product.price_c,
          rating: product.rating_c,
          stock: product.stock_c,
          images: JSON.parse(product.images_c || '[]'),
          sizes: JSON.parse(product.sizes_c || '[]'),
          reviews: []
        }))
    } catch (error) {
      console.error(`Error fetching related products for ${productId}:`, error?.response?.data?.message || error)
      return []
    }
}
}