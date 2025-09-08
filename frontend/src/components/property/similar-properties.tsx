import { PropertyCard } from "@/components/properties/property-card"
import type { Property } from "@/lib/types"

interface SimilarPropertiesProps {
  currentProperty: Property
  allProperties: Property[]
  onFavoriteToggle?: (propertyId: string) => void
  favorites?: string[]
}

export function SimilarProperties({
  currentProperty,
  allProperties,
  onFavoriteToggle,
  favorites = [],
}: SimilarPropertiesProps) {
  // Find similar properties based on location, price range, and property type
  const similarProperties = allProperties
    .filter((property) => {
      // Exclude current property
      if (property._id === currentProperty._id) return false

      // Same city or nearby price range
      const sameCity = property.location.city === currentProperty.location.city
      const similarPrice = Math.abs(property.price - currentProperty.price) <= currentProperty.price * 0.3
      const sameType = property.propertyType === currentProperty.propertyType

      // Prioritize same city, then similar price, then same type
      return sameCity || similarPrice || sameType
    })
    .sort((a, b) => {
      // Sort by relevance score
      let scoreA = 0
      let scoreB = 0

      // Same city gets highest score
      if (a.location.city === currentProperty.location.city) scoreA += 3
      if (b.location.city === currentProperty.location.city) scoreB += 3

      // Similar price gets medium score
      if (Math.abs(a.price - currentProperty.price) <= currentProperty.price * 0.2) scoreA += 2
      if (Math.abs(b.price - currentProperty.price) <= currentProperty.price * 0.2) scoreB += 2

      // Same type gets low score
      if (a.propertyType === currentProperty.propertyType) scoreA += 1
      if (b.propertyType === currentProperty.propertyType) scoreB += 1

      return scoreB - scoreA
    })
    .slice(0, 3) // Show only 3 similar properties

  if (similarProperties.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onFavoriteToggle={onFavoriteToggle}
            isFavorited={favorites.includes(property._id)}
          />
        ))}
      </div>
    </section>
  )
}
