import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  FileText,
  HeartPulse,
  Home,
  Info,
  LayoutDashboard,
  ListFilter,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type View = 'home' | 'doctors' | 'appointments' | 'dashboard' | 'contact';
type AuthMode = 'login' | 'signup';
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: string;
  reviews: string;
  location: string;
  image: string;
  accent: string;
  slots: string[];
};
type Appointment = {
  id: string;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'completed';
};

type AuthForm = { email: string; password: string; fullName: string };

const doctors: Doctor[] = [
  {
    id: 'raj-sharma',
    name: 'Dr. Raj Sharma',
    specialty: 'Cardiologist',
    experience: '12 years experience',
    rating: '4.8',
    reviews: '120+ reviews',
    location: 'Delhi, India',
    image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=640',
    accent: 'bg-cyan-50',
    slots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'],
  },
  {
    id: 'neha-patel',
    name: 'Dr. Neha Patel',
    specialty: 'Dentist',
    experience: '8 years experience',
    rating: '4.9',
    reviews: '96+ reviews',
    location: 'Mumbai, India',
    image: 'https://images.pexels.com/photos/5214958/pexels-photo-5214958.jpeg?auto=compress&cs=tinysrgb&w=640',
    accent: 'bg-rose-50',
    slots: ['10:00 AM', '01:00 PM', '03:00 PM'],
  },
  {
    id: 'vaishnavi-nair',
    name: 'Dr. Vaishnavi Nair',
    specialty: 'Orthopedic',
    experience: '10 years experience',
    rating: '4.8',
    reviews: '80+ reviews',
    location: 'Bengaluru, India',
    image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=640',
    accent: 'bg-amber-50',
    slots: ['09:00 AM', '02:00 PM', '04:00 PM'],
  },
  {
    id: 'anita-mehta',
    name: 'Dr. Anita Mehta',
    specialty: 'Pediatrician',
    experience: '15 years experience',
    rating: '4.9',
    reviews: '140+ reviews',
    location: 'Pune, India',
    image: 'https://images.pexels.com/photos/5452202/pexels-photo-5452202.jpeg?auto=compress&cs=tinysrgb&w=640',
    accent: 'bg-emerald-50',
    slots: ['11:00 AM', '12:00 PM', '05:00 PM'],
  },
];

const categories = [
  { label: 'Dentist', icon: Activity, color: 'bg-sky-50 text-sky-600' },
  { label: 'Cardiologist', icon: HeartPulse, color: 'bg-rose-50 text-rose-500' },
  { label: 'Pediatrician', icon: UsersRound, color: 'bg-amber-50 text-amber-600' },
  { label: 'Orthopedic', icon: Stethoscope, color: 'bg-slate-100 text-slate-600' },
];

const navItems: { label: string; view: View; icon: typeof Home }[] = [
  { label: 'Home', view: 'home', icon: Home },
  { label: 'Doctors', view: 'doctors', icon: UsersRound },
  { label: 'Appointments', view: 'appointments', icon: CalendarDays },
  { label: 'My dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'Contact', view: 'contact', icon: MessageCircle },
];

function App() {
  const [view, setView] = useState<View>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [session, setSession] = useState<Session | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setAuthOpen(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setAppointments([]);
      return;
    }
    supabase
      .from('appointments')
      .select('id, doctor_name, specialization, appointment_date, appointment_time, reason, status')
      .order('appointment_date', { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setAppointments(data as Appointment[]);
      });
  }, [session]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const displayName = session?.user.user_metadata.full_name?.split(' ')[0] ?? 'Maya';

  const navigate = (nextView: View) => {
    setView(nextView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startBooking = (doctor?: Doctor) => {
    if (!session) {
      setAuthMode('login');
      setAuthOpen(true);
      setToast('Please sign in to book an appointment.');
      return;
    }
    setSelectedDoctor(doctor ?? doctors[0]);
    navigate('appointments');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setToast('You have been signed out.');
  };

  return (
    <div className="min-h-screen bg-[#f7fbfb] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100/90 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <button className="flex items-center gap-3" onClick={() => navigate('home')} aria-label="MediCare home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0d9d92] text-white shadow-lg shadow-teal-100">
              <HeartPulse size={22} strokeWidth={2.3} />
            </span>
            <span className="text-left">
              <span className="block text-[17px] font-bold tracking-tight text-slate-800">MediCare</span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#0d9d92]">Care made simple</span>
            </span>
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <button key={item.view} onClick={() => navigate(item.view)} className={`nav-link ${view === item.view ? 'nav-link-active' : ''}`}>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {session ? (
              <div className="flex items-center gap-3">
                <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
                <button onClick={() => navigate('dashboard')} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dff6f3] text-[#087e77]"><UserRound size={16} /></span>
                  {displayName}
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="button-secondary"><LogIn size={16} /> Sign in</button>
            )}
            <button onClick={() => startBooking()} className="button-primary">Book appointment <ArrowRight size={16} /></button>
          </div>

          <button className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50 text-slate-700 md:hidden" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Open menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileMenuOpen && <MobileMenu view={view} session={session} onNavigate={navigate} onSignIn={() => { setAuthOpen(true); setMobileMenuOpen(false); }} onBook={() => startBooking()} onSignOut={handleSignOut} />}
      </header>

      <main>
        {view === 'home' && <HomeView displayName={displayName} session={session} onBook={startBooking} onNavigate={navigate} onCategory={(category) => navigateToDoctors(navigate, category)} />}
        {view === 'doctors' && <DoctorsView onBook={startBooking} />}
        {view === 'appointments' && <BookingView session={session} selectedDoctor={selectedDoctor} onRequireAuth={() => setAuthOpen(true)} onSuccess={(appointment) => { setAppointments((items) => [...items, appointment]); setToast('Appointment confirmed. We sent the details to your email.'); navigate('dashboard'); }} />}
        {view === 'dashboard' && <DashboardView session={session} displayName={displayName} appointments={appointments} onBook={startBooking} onSignIn={() => setAuthOpen(true)} />}
        {view === 'contact' && <ContactView onToast={setToast} />}
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-2 font-bold text-slate-800"><span className="grid h-7 w-7 place-items-center rounded-lg bg-[#0d9d92] text-white"><HeartPulse size={15} /></span> MediCare</div>
          <p>Trusted care, one appointment at a time.</p>
          <p>© 2025 MediCare Health</p>
        </div>
      </footer>

      {authOpen && <AuthModal mode={authMode} onModeChange={setAuthMode} onClose={() => setAuthOpen(false)} onToast={setToast} />}
      {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl"><Check size={17} className="text-teal-300" /> {toast}</div>}
    </div>
  );
}

function navigateToDoctors(navigate: (view: View) => void, category: string) {
  navigate('doctors');
  window.setTimeout(() => window.dispatchEvent(new CustomEvent('doctor-category', { detail: category })), 0);
}

function MobileMenu({ view, session, onNavigate, onSignIn, onBook, onSignOut }: { view: View; session: Session | null; onNavigate: (view: View) => void; onSignIn: () => void; onBook: () => void; onSignOut: () => void }) {
  return <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden"><nav className="grid gap-1">{navItems.map((item) => { const Icon = item.icon; return <button key={item.view} onClick={() => onNavigate(item.view)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${view === item.view ? 'bg-teal-50 text-[#0d8e84]' : 'text-slate-600'}`}><Icon size={17} /> {item.label}</button>; })}</nav><div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">{session ? <button onClick={onSignOut} className="button-secondary flex-1"><LogOut size={16} /> Sign out</button> : <button onClick={onSignIn} className="button-secondary flex-1"><LogIn size={16} /> Sign in</button>}<button onClick={onBook} className="button-primary flex-1">Book now</button></div></div>;
}

function HomeView({ displayName, session, onBook, onNavigate, onCategory }: { displayName: string; session: Session | null; onBook: (doctor?: Doctor) => void; onNavigate: (view: View) => void; onCategory: (category: string) => void }) {
  return <>
    <section className="relative overflow-hidden bg-[#e9f8f5]">
      <div className="absolute -right-20 -top-28 h-96 w-96 rounded-full bg-[#ccefe8] blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div className="relative z-10">
          <div className="eyebrow"><Sparkles size={14} /> Your health, our priority</div>
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.05em] text-slate-900 sm:text-5xl lg:text-[66px]">Care that fits <span className="text-[#0d9d92]">your life.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Book trusted doctors in minutes, manage your visits with ease, and get the care you need from a team that listens.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={() => onBook()} className="button-primary justify-center px-6 py-3.5">Book an appointment <ArrowRight size={17} /></button><button onClick={() => onNavigate('doctors')} className="button-ghost justify-center px-6 py-3.5"><Search size={17} /> Find a doctor</button></div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500"><span className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#0d9d92]" /> Verified professionals</span><span className="flex items-center gap-2"><Clock3 size={17} className="text-[#0d9d92]" /> 24/7 support</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-[530px]">
          <div className="absolute -left-2 top-8 z-20 hidden items-center gap-3 rounded-2xl bg-white p-3 shadow-xl shadow-teal-900/10 sm:flex"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><Check size={20} /></span><span><strong className="block text-sm text-slate-800">Easy booking</strong><small className="text-xs text-slate-500">in under 2 minutes</small></span></div>
          <div className="relative overflow-hidden rounded-[34px] rounded-br-[110px] border-[12px] border-white/70 bg-white shadow-2xl shadow-teal-900/10"><img src="https://images.pexels.com/photos/7659568/pexels-photo-7659568.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Doctor speaking with a patient" className="h-[420px] w-full object-cover sm:h-[510px]" /><div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Next available</span><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">Today</span></div><div className="mt-2 flex items-center justify-between"><div><p className="font-bold text-slate-800">Dr. Raj Sharma</p><p className="text-xs text-slate-500">Cardiologist · Delhi</p></div><button onClick={() => onBook(doctors[0])} className="rounded-xl bg-[#0d9d92] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#087e77]">View profile</button></div></div></div>
          <div className="absolute -bottom-7 -right-2 grid h-24 w-24 place-items-center rounded-full bg-[#f5c98a] text-center text-xs font-bold text-slate-800 shadow-lg sm:-right-8"><span><strong className="block text-2xl">4.9</strong><span className="flex items-center gap-0.5"><Star size={11} fill="currentColor" /> rated</span></span></div>
        </div>
      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">Explore care</p><h2 className="section-title">How can we help today?</h2></div><button onClick={() => onNavigate('doctors')} className="link-button">View all specialties <ArrowRight size={16} /></button></div>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{categories.map(({ label, icon: Icon, color }) => <button key={label} onClick={() => onCategory(label)} className="category-card"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}><Icon size={22} /></span><span className="mt-4 text-sm font-bold text-slate-800">{label}</span><span className="mt-1 text-xs text-slate-400">Find specialists</span></button>)}</div>
    </section>
    <section className="bg-white"><div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker">Meet your care team</p><h2 className="section-title">Doctors you can trust</h2></div><button onClick={() => onNavigate('doctors')} className="link-button">Browse all doctors <ArrowRight size={16} /></button></div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} onBook={onBook} />)}</div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20"><div className="overflow-hidden rounded-[28px] bg-[#0d9d92] px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-100">{session ? `Good to see you, ${displayName}` : 'Your care starts here'}</p><h2 className="mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">A healthier tomorrow starts with one small step.</h2></div><button onClick={() => onBook()} className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-[#087e77] transition hover:bg-teal-50 lg:mt-0">Book your visit <ArrowRight size={17} /></button></div></section>
  </>;
}

function DoctorCard({ doctor, onBook }: { doctor: Doctor; onBook: (doctor: Doctor) => void }) {
  return <article className="group rounded-3xl border border-slate-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"><div className={`relative overflow-hidden rounded-2xl ${doctor.accent}`}><img src={doctor.image} alt={doctor.name} className="h-56 w-full object-cover object-top transition duration-500 group-hover:scale-105" /><span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-xs font-bold text-slate-700"><Star size={12} fill="#f5b84b" className="text-[#f5b84b]" /> {doctor.rating}</span></div><div className="px-2 pb-2 pt-4"><h3 className="font-bold text-slate-800">{doctor.name}</h3><p className="mt-1 text-sm font-medium text-[#0d9d92]">{doctor.specialty}</p><p className="mt-3 text-xs text-slate-500">{doctor.experience}</p><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="flex items-center gap-1 text-xs text-slate-500"><MapPin size={13} /> {doctor.location.split(',')[0]}</span><button onClick={() => onBook(doctor)} className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-bold text-[#087e77] transition hover:bg-[#0d9d92] hover:text-white">Book now</button></div></div></article>;
}

function DoctorsView({ onBook }: { onBook: (doctor: Doctor) => void }) {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('All specialties');
  const [categoryEvent, setCategoryEvent] = useState('');
  useEffect(() => { const handler = (event: Event) => setCategoryEvent((event as CustomEvent<string>).detail); window.addEventListener('doctor-category', handler); return () => window.removeEventListener('doctor-category', handler); }, []);
  const activeSpecialty = categoryEvent || specialty;
  const filteredDoctors = doctors.filter((doctor) => `${doctor.name} ${doctor.specialty} ${doctor.location}`.toLowerCase().includes(query.toLowerCase()) && (activeSpecialty === 'All specialties' || doctor.specialty === activeSpecialty));
  return <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16"><div className="max-w-2xl"><p className="section-kicker">Find your specialist</p><h1 className="section-title text-4xl sm:text-5xl">The right care is closer than you think.</h1><p className="mt-4 text-slate-500">Explore our verified network of experienced doctors and choose a time that works for you.</p></div><div className="mt-8 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm sm:flex sm:items-center sm:gap-3"><div className="flex flex-1 items-center gap-3 px-3"><Search size={19} className="text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by doctor, specialty, or city" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-slate-400" /></div><div className="my-2 h-px bg-slate-100 sm:my-0 sm:h-8 sm:w-px" /><div className="flex items-center gap-2 px-3"><ListFilter size={17} className="text-slate-400" /><select value={specialty} onChange={(event) => { setSpecialty(event.target.value); setCategoryEvent(''); }} className="bg-transparent py-3 text-sm font-semibold text-slate-700 outline-none"><option>All specialties</option>{categories.map(({ label }) => <option key={label}>{label}</option>)}</select></div></div><div className="mt-10 flex items-center justify-between"><p className="text-sm font-semibold text-slate-500">{filteredDoctors.length} doctors available</p><div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available today</div></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{filteredDoctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} onBook={onBook} />)}</div>{filteredDoctors.length === 0 && <div className="mt-8 rounded-3xl bg-white p-10 text-center text-slate-500">No doctors match your search. Try another specialty.</div>}</section>;
}

function BookingView({ session, selectedDoctor, onRequireAuth, onSuccess }: { session: Session | null; selectedDoctor: Doctor | null; onRequireAuth: () => void; onSuccess: (appointment: Appointment) => void }) {
  const [doctorId, setDoctorId] = useState(selectedDoctor?.id ?? doctors[0].id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reason, setReason] = useState('');
  const [patientName, setPatientName] = useState(session?.user.user_metadata.full_name ?? '');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const doctor = doctors.find((item) => item.id === doctorId) ?? doctors[0];
  const dateOptions = useMemo(() => Array.from({ length: 5 }, (_, index) => { const day = new Date(); day.setDate(day.getDate() + index + 1); return { value: day.toISOString().slice(0, 10), label: day.toLocaleDateString('en-US', { weekday: 'short' }), day: day.getDate(), month: day.toLocaleDateString('en-US', { month: 'short' }) }; }), []);
  useEffect(() => { if (selectedDoctor) setDoctorId(selectedDoctor.id); }, [selectedDoctor]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); if (!session) { onRequireAuth(); return; } if (!date || !time || !patientName || !phone) { setError('Please complete your name, phone, date, and time.'); return; } const { data, error: insertError } = await supabase.from('appointments').insert({ patient_name: patientName, patient_email: session.user.email ?? '', patient_phone: phone, doctor_name: doctor.name, specialization: doctor.specialty, appointment_date: date, appointment_time: time, reason }).select('id, doctor_name, specialization, appointment_date, appointment_time, reason, status').maybeSingle(); if (insertError || !data) { setError(insertError?.message ?? 'We could not save your appointment. Please try again.'); return; } onSuccess(data as Appointment); };
  return <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-16"><button className="back-button" onClick={() => window.history.back()}><ArrowLeft size={16} /> Back</button><div className="mt-7 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="section-kicker">Plan your visit</p><h1 className="section-title text-4xl">Book an appointment</h1><p className="mt-4 text-slate-500">Choose a specialist, pick a convenient time, and we’ll take care of the rest.</p><div className="mt-8 rounded-3xl bg-[#e9f8f5] p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#0d8e84]">Selected doctor</p><div className="mt-4 flex items-center gap-3"><img src={doctor.image} alt={doctor.name} className="h-14 w-14 rounded-2xl object-cover object-top" /><div><p className="font-bold text-slate-800">{doctor.name}</p><p className="text-sm text-slate-500">{doctor.specialty} · {doctor.location}</p></div></div><div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={15} className="text-[#0d9d92]" /> Verified MediCare provider</div></div></div><form onSubmit={submit} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="field-label sm:col-span-2">Choose doctor<select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} className="field-input">{doctors.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.specialty}</option>)}</select></label><label className="field-label">Your full name<input required value={patientName} onChange={(event) => setPatientName(event.target.value)} placeholder="Maya Johnson" className="field-input" /></label><label className="field-label">Phone number<input required value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+91 98765 43210" className="field-input" /></label></div><div className="mt-7"><p className="field-label">Select a date</p><div className="mt-3 grid grid-cols-5 gap-2">{dateOptions.map((option) => <button type="button" key={option.value} onClick={() => setDate(option.value)} className={`rounded-2xl border px-2 py-3 text-center transition ${date === option.value ? 'border-[#0d9d92] bg-[#0d9d92] text-white shadow-lg shadow-teal-100' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-teal-200'}`}><span className="block text-[10px] font-bold uppercase">{option.label}</span><strong className="mt-1 block text-lg">{option.day}</strong><span className="block text-[10px]">{option.month}</span></button>)}</div></div><div className="mt-7"><p className="field-label">Select a time</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{doctor.slots.map((slot) => <button type="button" key={slot} onClick={() => setTime(slot)} className={`rounded-xl border px-2 py-3 text-xs font-semibold transition ${time === slot ? 'border-[#0d9d92] bg-teal-50 text-[#087e77]' : 'border-slate-100 bg-white text-slate-600 hover:border-teal-200'}`}><Clock3 size={13} className="mx-auto mb-1" />{slot}</button>)}</div></div><label className="field-label mt-7">Reason for visit <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Tell the doctor a little about your visit..." className="field-input resize-none" /></label>{error && <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}<button type="submit" className="button-primary mt-7 w-full justify-center py-3.5">Confirm appointment <ArrowRight size={17} /></button><p className="mt-3 text-center text-xs text-slate-400">Free cancellation up to 24 hours before your visit.</p></form></div></section>;
}

function DashboardView({ session, displayName, appointments, onBook, onSignIn }: { session: Session | null; displayName: string; appointments: Appointment[]; onBook: () => void; onSignIn: () => void }) {
  if (!session) return <section className="mx-auto max-w-2xl px-5 py-20 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-teal-50 text-[#0d9d92]"><UserRound size={27} /></span><h1 className="mt-6 text-3xl font-bold tracking-tight">Your care dashboard</h1><p className="mt-3 text-slate-500">Sign in to view upcoming visits, appointment history, and your patient profile.</p><button onClick={onSignIn} className="button-primary mx-auto mt-7">Sign in to continue <ArrowRight size={17} /></button></section>;
  return <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="section-kicker">Patient dashboard</p><h1 className="section-title">Good morning, {displayName}.</h1><p className="mt-3 text-slate-500">Here’s a simple view of your care journey.</p></div><button onClick={onBook} className="button-primary w-fit">Book a new visit <ArrowRight size={17} /></button></div><div className="mt-9 grid gap-5 md:grid-cols-3"><div className="stat-card"><span className="stat-icon bg-teal-50 text-[#0d9d92]"><CalendarDays size={19} /></span><div><p className="text-2xl font-bold text-slate-800">{appointments.length}</p><p className="text-xs text-slate-500">Total appointments</p></div></div><div className="stat-card"><span className="stat-icon bg-amber-50 text-amber-600"><Clock3 size={19} /></span><div><p className="text-2xl font-bold text-slate-800">{appointments.filter((item) => item.status === 'confirmed').length}</p><p className="text-xs text-slate-500">Upcoming visits</p></div></div><div className="stat-card"><span className="stat-icon bg-sky-50 text-sky-600"><FileText size={19} /></span><div><p className="text-2xl font-bold text-slate-800">{appointments.filter((item) => item.status === 'completed').length}</p><p className="text-xs text-slate-500">Completed visits</p></div></div></div><div className="mt-10 grid gap-7 lg:grid-cols-[1.35fr_0.65fr]"><div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Your appointments</h2><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-[#087e77]">{appointments.length} total</span></div>{appointments.length === 0 ? <div className="py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-50 text-slate-400"><CalendarDays size={23} /></span><p className="mt-4 font-semibold text-slate-700">No appointments yet</p><p className="mt-1 text-sm text-slate-500">Your confirmed visits will appear here.</p><button onClick={onBook} className="link-button mx-auto mt-4">Find a doctor <ArrowRight size={16} /></button></div> : <div className="mt-5 grid gap-3">{appointments.map((appointment) => <div key={appointment.id} className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0d9d92]"><Stethoscope size={19} /></span><div><p className="font-bold text-slate-800">{appointment.doctor_name}</p><p className="mt-1 text-xs text-slate-500">{appointment.specialization} · {new Date(`${appointment.appointment_date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p></div></div><div className="flex items-center justify-between gap-4 sm:justify-end"><span className="text-sm font-semibold text-slate-600">{appointment.appointment_time}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${appointment.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{appointment.status}</span></div></div>)}</div>}</div><div className="rounded-3xl bg-[#0d9d92] p-6 text-white"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15"><ShieldCheck size={22} /></span><h2 className="mt-6 text-xl font-bold">Your care is secure</h2><p className="mt-3 text-sm leading-6 text-teal-50">Your health information is kept private and your appointments are protected.</p><div className="mt-8 flex items-center gap-2 text-xs font-semibold text-teal-100"><Check size={15} /> Verified and encrypted</div></div></div></section>;
}

function ContactView({ onToast }: { onToast: (message: string) => void }) { const [sent, setSent] = useState(false); return <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-16"><div className="grid gap-10 lg:grid-cols-2"><div><p className="section-kicker">We’re here to help</p><h1 className="section-title text-4xl sm:text-5xl">Have a question? Let’s talk.</h1><p className="mt-5 max-w-md text-slate-500">Our patient care team is available to help with bookings, directions, and anything else you need.</p><div className="mt-9 grid gap-4"><div className="contact-item"><span><Phone size={18} /></span><div><strong>Call us</strong><p>+91 1800 123 4567</p></div></div><div className="contact-item"><span><Mail size={18} /></span><div><strong>Email support</strong><p>hello@medicare.health</p></div></div><div className="contact-item"><span><MapPin size={18} /></span><div><strong>Visit our clinic</strong><p>14 Wellness Avenue, New Delhi</p></div></div></div></div><form className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8" onSubmit={(event) => { event.preventDefault(); setSent(true); onToast('Thanks. Our care team will be in touch soon.'); }}><h2 className="text-xl font-bold">Send us a message</h2>{sent ? <div className="flex min-h-64 flex-col items-center justify-center text-center"><span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={25} /></span><p className="mt-4 font-bold">Message sent</p><p className="mt-1 text-sm text-slate-500">We’ll get back to you shortly.</p></div> : <div className="mt-6 grid gap-4"><label className="field-label">Your name<input required className="field-input" placeholder="Maya Johnson" /></label><label className="field-label">Email address<input required type="email" className="field-input" placeholder="maya@example.com" /></label><label className="field-label">How can we help?<textarea required rows={5} className="field-input resize-none" placeholder="Tell us what you need..." /></label><button className="button-primary justify-center py-3.5">Send message <ArrowRight size={17} /></button></div>}</form></div></section>; }

function AuthModal({ mode, onModeChange, onClose, onToast }: { mode: AuthMode; onModeChange: (mode: AuthMode) => void; onClose: () => void; onToast: (message: string) => void }) { const [form, setForm] = useState<AuthForm>({ email: '', password: '', fullName: '' }); const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); setLoading(true); const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password }) : await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.fullName } } }); setLoading(false); if (result.error) { setError(result.error.message); return; } if (mode === 'signup' && !result.data.session) { onClose(); onToast('Account created. You can now sign in.'); setForm({ email: form.email, password: '', fullName: '' }); onModeChange('login'); return; } onClose(); onToast(mode === 'login' ? 'Welcome back.' : 'Your account is ready.'); }; return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><button onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100" aria-label="Close"><X size={18} /></button><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-[#0d9d92]"><HeartPulse size={23} /></span><h2 className="mt-5 text-2xl font-bold tracking-tight">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-sm text-slate-500">{mode === 'login' ? 'Sign in to manage your appointments.' : 'Join MediCare for a simpler care experience.'}</p><form className="mt-6 grid gap-4" onSubmit={submit}>{mode === 'signup' && <label className="field-label">Full name<input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="field-input" placeholder="Maya Johnson" /></label>}<label className="field-label">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="field-input" placeholder="you@example.com" /></label><label className="field-label">Password<input required minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="field-input" placeholder="At least 6 characters" /></label>{error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}<button disabled={loading} className="button-primary justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button></form><p className="mt-5 text-center text-sm text-slate-500">{mode === 'login' ? 'New to MediCare?' : 'Already have an account?'} <button onClick={() => { setError(''); onModeChange(mode === 'login' ? 'signup' : 'login'); }} className="font-bold text-[#0d8e84]">{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p></div></div>; }

export default App;
