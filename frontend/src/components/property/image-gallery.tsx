"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { BackendImage } from "@/lib/types"

interface ImageGalleryProps {
  images: BackendImage[]
  title: string
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length)
  }

  const imageUrls = images.map(img => img.url)

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-[#FFE9D6] rounded-2xl flex items-center justify-center shadow-md">
        <span className="text-[#6B7280]">No images available</span>
      </div>
    )
  }

  // For collage: show first 5 images
  const collageImages = images.slice(0, 5)
  const hasMoreImages = images.length > 5
  const additionalImagesCount = images.length - 5

  const openFullscreenGallery = (startIndex: number = 0) => {
    setCurrentImage(startIndex)
    setIsGalleryOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Collage Layout */}
      <div className="relative group cursor-pointer" onClick={() => openFullscreenGallery()}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 h-96 lg:h-[500px] rounded-lg overflow-hidden">
          {/* Main large image (left side - 60% width on large screens) */}
          <div className="relative lg:col-span-3 rounded-lg overflow-hidden">
            <Image
              src={imageUrls[0] || "/placeholder.svg?height=500&width=600"}
              alt={`${title} - Main image`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          </div>

          {/* Right side 2x2 grid (40% width on large screens) */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-2">
            {collageImages.slice(1, 5).map((image, index) => {
              const isLastImage = index === 3 // 4th image in the slice (0-indexed)
              const actualIndex = index + 1 // Since we sliced from index 1

              return (
                <div key={actualIndex} className="relative rounded-lg overflow-hidden">
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={`${title} - Image ${actualIndex + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />

                  {/* "+N more" overlay on the last image if there are more images */}
                  {hasMoreImages && isLastImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        +{additionalImagesCount} more
                      </span>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Fill empty slots if less than 4 images in the grid */}
            {Array.from({ length: Math.max(0, 4 - collageImages.slice(1).length) }).map((_, index) => (
              <div key={`empty-${index}`} className="bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>

        {/* Fullscreen button overlay */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            openFullscreenGallery()
          }}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {images.length} photo{images.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Fullscreen Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-7xl w-full h-full p-0">
          {/* ✅ Hidden but accessible title */}
          <VisuallyHidden>
            <DialogTitle>{title} - Image Gallery</DialogTitle>
          </VisuallyHidden>

          <div className="relative w-full h-full bg-black">
            <Image
              src={imageUrls[currentImage] || "/placeholder.svg"}
              alt={`${title} - Image ${currentImage + 1}`}
              fill
              className="object-contain"
            />

            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setIsGalleryOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Navigation in Fullscreen */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImage + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentImage ? "border-blue-600" : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setCurrentImage(index)}
            >
              <Image
                src={image.url || "/placeholder.svg?height=64&width=80"}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
