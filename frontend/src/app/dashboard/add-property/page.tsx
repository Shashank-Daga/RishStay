// src/app/dashboard/add-property/page.tsx
import AddPropertyForm from "./addpropertyform"

export default async function AddPropertyPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  // If you want to support editing, get the property ID from searchParams
  const { id } = await searchParams

  // You could fetch property data here (server-side) if needed
  // But for now, we'll just pass editingId to the form
  return <AddPropertyForm editingId={id} />
}
