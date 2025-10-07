import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"
import Image from "next/image"

type Props = {
  images: string[]
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (index: number) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
}

export function ImagesSection({ images, onUpload, onRemove, fileInputRef }: Props) {
  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#E9E6F7]/30 to-[#FFE9D6]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          Property Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                <Image
                  src={img || "/placeholder.svg"}
                  alt="Property image"
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                onClick={() => onRemove(idx)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="outline"
            className="aspect-square border-dashed"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-center">
              <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <span className="text-sm text-gray-600">Add Image</span>
            </div>
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={onUpload}
          />
        </div>
      </CardContent>
    </Card>
  )
}
