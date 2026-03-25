"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useProducts } from "@/hooks/use-shopify"
import Link from "next/link"
import { useState } from "react"

// Placeholder products for when Shopify is not configured
const placeholderProducts = [
  {
    id: "placeholder-1",
    title: "Premium Wireless Headphones",
    price: 199.99,
    compareAtPrice: 249.99,
    image: "/placeholder.svg?height=300&width=300",
    handle: "premium-headphones",
  },
  {
    id: "placeholder-2",
    title: "Smart Fitness Watch",
    price: 299.99,
    compareAtPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    handle: "smart-watch",
  },
  {
    id: "placeholder-3",
    title: "Minimalist Backpack",
    price: 89.99,
    compareAtPrice: 119.99,
    image: "/placeholder.svg?height=300&width=300",
    handle: "minimalist-backpack",
  },
  {
    id: "placeholder-4",
    title: "Wireless Charging Pad",
    price: 49.99,
    compareAtPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    handle: "wireless-charger",
  },
  {
    id: "placeholder-5",
    title: "Bluetooth Speaker",
    price: 129.99,
    compareAtPrice: 159.99,
    image: "/placeholder.svg?height=300&width=300",
    handle: "bluetooth-speaker",
  },
  {
    id: "placeholder-6",
    title: "USB-C Hub",
    price: 79.99,
    compareAtPrice: null,
    image: "/placeholder.svg?height=300&width=300",
    handle: "usb-hub",
  },
]

export function FeaturedProducts() {
  const { products, loading, error } = useProducts()
  const { addItem, state: cartState } = useCart()
  // Track which products are being added to show individual loading states
  const [addingProducts, setAddingProducts] = useState<Set<string>>(new Set())

  // Check if Shopify store domain is configured
  const isShopifyConfigured = !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

  const handleAddToCart = async (product: any, event: React.MouseEvent) => {
    // Prevent any default behavior and event bubbling
    event.preventDefault()
    event.stopPropagation()

    // For placeholder products, just show a demo message
    if (!isShopifyConfigured) {
      alert("This is a demo. Connect your Shopify store to enable real cart functionality!")
      return
    }

    const variant = product.variants.edges[0]?.node
    if (variant) {
      // Add product ID to loading set
      setAddingProducts((prev) => new Set(prev).add(product.id))

      try {
        await addItem({
          id: variant.id,
          name: product.title,
          price: Number.parseFloat(variant.price.amount),
          image: product.images.edges[0]?.node.url || "/placeholder.svg",
          handle: product.handle,
        })
      } finally {
        // Remove product ID from loading set
        setAddingProducts((prev) => {
          const newSet = new Set(prev)
          newSet.delete(product.id)
          return newSet
        })
      }
    }
  }

  // Show loading state only for real products
  if (loading && isShopifyConfigured) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading featured products...</p>
          </div>
        </div>
      </section>
    )
  }

  // Determine which products to show
  const productsToShow = isShopifyConfigured && products.length > 0 ? products.slice(0, 6) : placeholderProducts

  // Show error only for configured stores
  if (error && isShopifyConfigured) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading featured products:</p>
            <p className="text-red-500 text-sm mb-4 break-words max-w-lg mx-auto">{error}</p>
            <p className="text-gray-600 text-sm">
              Please ensure your `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` environment variable is correctly set.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">Featured Products</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {isShopifyConfigured
              ? "Handpicked items from your store"
              : "Sample products - connect your Shopify store to see real products"}
          </p>
          {!isShopifyConfigured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 mt-2">
              Demo Mode
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {productsToShow.map((product, index) => {
            // Handle both real Shopify products and placeholder products
            const isRealProduct = isShopifyConfigured && products.length > 0

            let productData
            if (isRealProduct) {
              const variant = product.variants.edges[0]?.node
              const image = product.images.edges[0]?.node
              const price = variant ? Number.parseFloat(variant.price.amount) : 0
              const compareAtPrice = product.compareAtPriceRange.minVariantPrice.amount
              const hasDiscount = compareAtPrice && Number.parseFloat(compareAtPrice) > price
              const discount = hasDiscount
                ? Math.round(((Number.parseFloat(compareAtPrice) - price) / Number.parseFloat(compareAtPrice)) * 100)
                : 0

              productData = {
                id: product.id,
                title: product.title,
                price,
                compareAtPrice: compareAtPrice ? Number.parseFloat(compareAtPrice) : null,
                hasDiscount,
                discount,
                image: image?.url || "/placeholder.svg",
                imageAlt: image?.altText || product.title,
                handle: product.handle,
                available: variant?.availableForSale || false,
              }
            } else {
              // Use placeholder data
              const hasDiscount = product.compareAtPrice !== null
              const discount = hasDiscount
                ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                : 0

              productData = {
                id: product.id,
                title: product.title,
                price: product.price,
                compareAtPrice: product.compareAtPrice,
                hasDiscount,
                discount,
                image: product.image,
                imageAlt: product.title,
                handle: product.handle,
                available: true,
              }
            }

            // Check if this specific product is being added
            const isAddingThisProduct = addingProducts.has(productData.id)

            return (
              <div key={productData.id} className="h-full">
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col relative">
                  {!isShopifyConfigured && (
                    <Badge
                      variant="secondary"
                      className="absolute top-4 right-4 z-10 bg-yellow-100 text-yellow-800 text-xs"
                    >
                      Demo
                    </Badge>
                  )}

                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="relative overflow-hidden">
                      <Link href={isRealProduct ? `/product/${productData.handle}` : "#"}>
                        <img
                          src={productData.image || "/placeholder.svg"}
                          alt={productData.imageAlt}
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      </Link>

                      {productData.hasDiscount && (
                        <Badge className="absolute top-4 left-4 bg-black text-white">{productData.discount}% OFF</Badge>
                      )}

                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          type="button"
                          className="bg-white text-black hover:bg-gray-100 border border-gray-200"
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!productData.available || isAddingThisProduct}
                        >
                          {isAddingThisProduct ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <ShoppingCart className="w-4 h-4 mr-2" />
                          )}
                          {productData.available ? "Quick Add" : "Out of Stock"}
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <Link href={isRealProduct ? `/product/${productData.handle}` : "#"}>
                        <h3 className="font-semibold text-lg text-black mb-3 group-hover:text-gray-600 transition-colors cursor-pointer line-clamp-2 h-14 leading-7">
                          {productData.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-4 h-8">
                        <span className="text-2xl font-bold text-black">${productData.price.toFixed(2)}</span>
                        {productData.hasDiscount && productData.compareAtPrice && (
                          <>
                            <span className="text-lg text-gray-500 line-through">
                              ${productData.compareAtPrice.toFixed(2)}
                            </span>
                            <Badge variant="secondary" className="bg-gray-100 text-black text-xs">
                              {productData.discount}% OFF
                            </Badge>
                          </>
                        )}
                      </div>

                      <div className="mt-auto">
                        <Button
                          type="button"
                          className="w-full bg-black text-white hover:bg-black/90"
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!productData.available || isAddingThisProduct}
                        >
                          {isAddingThisProduct ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Add to Cart"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-black text-black hover:bg-black hover:text-white bg-transparent"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
