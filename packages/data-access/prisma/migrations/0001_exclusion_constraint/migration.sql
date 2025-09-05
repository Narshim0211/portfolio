-- Enable required extension for GiST btree support
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent overlapping appointments per staff when active/pending
-- Uses tstzrange(start, end) overlap operator &&
ALTER TABLE "Appointment"
ADD CONSTRAINT appointment_no_overlap
EXCLUDE USING gist (
  "staffId" WITH =,
  tstzrange("start", "end") WITH &&
) WHERE (
  status IN ('pending_payment'::"AppointmentStatus", 'confirmed'::"AppointmentStatus")
);

