import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MediaSectionProps {
  youtubeUrl: string;
  googleMapsUrl: string;
  onYoutubeUrlChange: (value: string) => void;
  onGoogleMapsUrlChange: (value: string) => void;
}

export default function MediaSection({
  youtubeUrl,
  googleMapsUrl,
  onYoutubeUrlChange,
  onGoogleMapsUrlChange,
}: MediaSectionProps) {
  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* YouTube Video URL */}
        <div className="space-y-2">
          <Label htmlFor="youtubeURL" className="text-[#003366] font-semibold text-sm">YouTube Video URL</Label>
          <Input
            id="youtubeURL"
            type="url"
            placeholder="Paste YouTube video URL here"
            value={youtubeUrl}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
          />
        </div>

        {/* Google Maps URL */}
        <div className="space-y-2">
          <Label htmlFor="mapURL" className="text-[#003366] font-semibold text-sm">Google Maps Location URL</Label>
          <Input
            id="mapURL"
            type="url"
            placeholder="Paste Google Maps URL here"
            value={googleMapsUrl}
            onChange={(e) => onGoogleMapsUrlChange(e.target.value)}
            className="border-2 border-[#003366]/20 focus:border-[#FFC107] focus:ring-2 focus:ring-[#FFC107]/20 transition-all h-11 bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}
