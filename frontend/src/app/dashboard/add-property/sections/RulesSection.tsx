import React from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PropertyData } from "../addpropertyform"

type Props = {
  rules: PropertyData["rules"]
  onChange: (rules: string[]) => void
}

export function RulesSection({ rules, onChange }: Props) {
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // Split by newlines
    const newRules = value.split('\n')
    onChange(newRules)
  }



  return (
    <Card className="rounded-2xl border-2 border-[#003366]/20 shadow-lg bg-white/95 backdrop-blur">
      <CardHeader className="border-b border-[#003366]/10 bg-gradient-to-r from-[#FFE9D6]/30 to-[#E9E6F7]/30">
        <CardTitle className="text-[#003366] text-xl flex items-center gap-2">
          <div className="w-1 h-6 bg-[#FFC107] rounded-full"></div>
          House Rules
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-6">
        <Textarea
          value={rules.join("\n")}
          onChange={handleTextareaChange}
          placeholder={`Enter each rule on a new line:\nNo smoking\nNo pets allowed\nCheck-in after 3 PM`}
          rows={6}
          className="resize-none"
        />
        <p className="text-sm text-gray-600 mt-2">
          💡 Each line represents a separate house rule. Press Enter to add a new rule on a new line.
        </p>
      </CardContent>
    </Card>
  )
}
