/*
# Create appointment records for the hospital booking experience

1. New Tables
- `appointments`
- `id` (uuid, primary key)
- `user_id` (uuid, required owner, defaults to the signed-in user)
- `patient_name` (text, patient display name)
- `patient_email` (text, contact email)
- `patient_phone` (text, contact phone)
- `doctor_name` (text, selected doctor)
- `specialization` (text, selected doctor's specialty)
- `appointment_date` (date, selected day)
- `appointment_time` (text, selected time slot)
- `reason` (text, optional appointment note)
- `status` (text, pending/confirmed/completed)
- `created_at` (timestamp, creation time)
2. Security
- Row level security is enabled on `appointments`.
- Signed-in patients can only read, create, update, or delete their own appointment records.
3. Important Notes
- Appointment ownership is assigned by the database from the authenticated session.
- Status values are constrained to the supported booking states.
*/

CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_name text NOT NULL,
  patient_email text NOT NULL,
  patient_phone text NOT NULL,
  doctor_name text NOT NULL,
  specialization text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  reason text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Patients can view own appointments" ON public.appointments;
CREATE POLICY "Patients can view own appointments"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can create own appointments" ON public.appointments;
CREATE POLICY "Patients can create own appointments"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can update own appointments" ON public.appointments;
CREATE POLICY "Patients can update own appointments"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Patients can delete own appointments" ON public.appointments;
CREATE POLICY "Patients can delete own appointments"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS appointments_user_date_idx
  ON public.appointments (user_id, appointment_date, appointment_time);