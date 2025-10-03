# TODO for Room-wise and Full Property Rent Feature

## Backend
- [ ] Update Property schema (backend/models/Property.js) to add `rooms` array with fields:
  - roomName: String
  - rent: Number
  - size: Number
  - amenities: [String]
  - status: { type: String, enum: ["available", "booked"], default: "available" }
  - description: String
- [ ] Update property create route (backend/routes/property.js) to accept and save `rooms` array.
- [ ] Update property update route (backend/routes/property.js) to accept and update `rooms` array.
- [ ] Ensure property fetch routes return `rooms` data.

## Frontend - Landlord Flow
- [ ] Update property add/edit form (frontend/src/app/dashboard/add-property/addpropertyform.tsx):
  - Add UI section to dynamically add/edit multiple rooms.
  - Each room has inputs for roomName, rent, size, amenities (multi-select), description, status.
  - Include rooms data in propertyData sent to backend on submit.

## Frontend - Tenant Flow
- [ ] Update property details page (frontend/src/app/properties/[id]/page.tsx):
  - Show full property rent card (existing).
  - Add new "Property Rooms" section below with room cards.
  - Each room card shows roomName, rent, size, amenities, status.
  - If room is available, show buttons for "Send Inquiry" and "Schedule Visit".
  - If booked, mark room as unavailable.

## Frontend - Components
- [ ] Create reusable components for room cards and tenant interactions under frontend/src/components/property/

## Testing
- [ ] Test backend API for property create, update, fetch with rooms.
- [ ] Test landlord UI for adding/editing rooms.
- [ ] Test tenant UI for viewing rooms and booking options.
- [ ] Verify tenant can book only one room or full property at a time.

---

Next step: Implement backend schema and routes updates.
