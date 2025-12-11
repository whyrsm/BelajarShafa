'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  ArrowRight, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  BarChart3, 
  Layout, 
  Palette, 
  Calendar, 
  Trophy, 
  PlayCircle, 
  Award, 
  Clock, 
  Shield, 
  Zap, 
  Server,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'organisasi' | 'mentor' | 'mentee'>('organisasi');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80; // Account for fixed header height + padding
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    // Close mobile menu if open
    setMobileMenuOpen(false);
  };

  return (
    <main className="min-h-screen font-sans selection:bg-primary/20">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">BelajarShafa</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Fitur</a>
            <a href="#testimonials" onClick={(e) => handleSmoothScroll(e, 'testimonials')} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Testimoni</a>
            <a href="#pricing" onClick={(e) => handleSmoothScroll(e, 'pricing')} className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Harga</a>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium">Daftar</Button>
              </Link>
            </div>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-5">
            <a href="#features" onClick={(e) => handleSmoothScroll(e, 'features')} className="text-sm font-medium p-2 hover:bg-muted rounded-md cursor-pointer">Fitur</a>
            <a href="#testimonials" onClick={(e) => handleSmoothScroll(e, 'testimonials')} className="text-sm font-medium p-2 hover:bg-muted rounded-md cursor-pointer">Testimoni</a>
            <a href="#pricing" onClick={(e) => handleSmoothScroll(e, 'pricing')} className="text-sm font-medium p-2 hover:bg-muted rounded-md cursor-pointer">Harga</a>
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/login">
                <Button variant="outline" className="w-full justify-center">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="w-full justify-center">Daftar</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Platform Mentoring #1 untuk Organisasi Pembinaan Karakter
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight text-slate-900 dark:text-slate-50">
            Sistem Mentoring yang <span className="text-primary">Scale</span> Tanpa Kehilangan Esensi Pendidikan Karakter
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Platform mentoring management dan LMS yang membantu organisasi pendidikan Islam mengelola program berkualitas untuk ratusan mentee tanpa mentor kewalahan.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in delay-100">
            <Link href="/register?type=organization">
              <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary transition-all shadow-lg hover:shadow-primary/25">
                Mulai Untuk Organisasi
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/register?type=mentor">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2 hover:bg-muted/50">
                Gabung Sebagai Mentor
              </Button>
            </Link>
          </div>

          {/* Visual Placeholder */}
          <div className="relative max-w-5xl mx-auto mt-12 rounded-xl border bg-background/50 shadow-2xl p-2 backdrop-blur-sm animate-fade-in delay-200">
            <div className="rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900 aspect-[16/9] relative group border border-slate-100 dark:border-slate-800">
              {/* Abstract Dashboard Line Art */}
              <svg className="w-full h-full text-slate-300 dark:text-slate-700" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
                
                {/* Background Grid (Subtle) */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Sidebar */}
                <rect x="20" y="20" width="220" height="635" rx="12" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>
                {/* Sidebar Items */}
                <circle cx="60" cy="70" r="16" stroke="currentColor" strokeWidth="2"/>
                <rect x="90" y="60" width="110" height="20" rx="4" fill="currentColor" fillOpacity="0.2"/>
                
                {[140, 200, 260, 320, 380].map((y, i) => (
                  <g key={i}>
                    <rect x="50" y={y} width="24" height="24" rx="6" stroke="currentColor" strokeWidth="2"/>
                    <line x1="90" y1={y+12} x2="200" y2={y+12} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </g>
                ))}

                {/* Top Header */}
                <rect x="260" y="20" width="920" height="80" rx="12" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeWidth="2"/>
                <circle cx="1140" cy="60" r="20" stroke="currentColor" strokeWidth="2"/>
                <rect x="1000" y="50" width="100" height="20" rx="4" fill="currentColor" fillOpacity="0.1"/>

                {/* Main Content Area */}
                
                {/* Stats Cards Row */}
                {[260, 580, 900].map((x, i) => (
                  <g key={i}>
                    <rect x={x} y="120" width="280" height="140" rx="12" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.02"/>
                    <circle cx={x+40} cy="160" r="16" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
                    <rect x={x+80} y="150" width="100" height="20" rx="4" fill="currentColor" fillOpacity="0.1"/>
                    <rect x={x+40} y="200" width="140" height="30" rx="4" fill="currentColor" fillOpacity="0.2"/>
                  </g>
                ))}

                {/* Chart Section */}
                <rect x="260" y="280" width="600" height="375" rx="12" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.02"/>
                {/* Chart Axes */}
                <line x1="300" y1="600" x2="820" y2="600" stroke="currentColor" strokeWidth="2"/>
                <line x1="300" y1="600" x2="300" y2="340" stroke="currentColor" strokeWidth="2"/>
                {/* Chart Line */}
                <path d="M 300 550 C 350 550, 350 450, 400 450 S 450 500, 500 500 S 550 400, 600 380 S 650 420, 700 420 S 750 350, 820 320" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" className="text-primary"/>
                {/* Chart Area Fill (Gradient simulation) */}
                <path d="M 300 550 C 350 550, 350 450, 400 450 S 450 500, 500 500 S 550 400, 600 380 S 650 420, 700 420 S 750 350, 820 320 V 600 H 300 Z" fill="currentColor" fillOpacity="0.05" className="text-primary"/>

                {/* Right Side List/Feed */}
                <rect x="880" y="280" width="300" height="375" rx="12" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.02"/>
                {[320, 390, 460, 530, 600].map((y, i) => (
                  <g key={i}>
                    <circle cx="920" cy={y+15} r="12" fill="currentColor" fillOpacity="0.1"/>
                    <line x1="950" y1={y+10} x2="1140" y2={y+10} stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="950" y1={y+25} x2="1050" y2={y+25} stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  </g>
                ))}

                {/* Floating Elements for Depth */}
                <circle cx="820" cy="320" r="6" fill="white" stroke="currentColor" strokeWidth="3" className="text-primary animate-pulse"/>
                
              </svg>
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Mengelola Program Mentoring Itu Menantang</h2>
            <p className="text-lg text-muted-foreground">
              Banyak organisasi pendidikan Islam memiliki visi besar, namun terhambat oleh kendala operasional saat mencoba menjangkau lebih banyak peserta.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <Layout className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Fragmentasi</h3>
              <p className="text-muted-foreground leading-relaxed">
                Program tersebar di berbagai platform, mentor kesulitan track progress, dan data tidak terintegrasi membuat pengelolaan menjadi chaotic.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Trade-off Kualitas</h3>
              <p className="text-muted-foreground leading-relaxed">
                Scale up seringkali berarti kualitas turun. Mentoring personal menjadi sulit dilakukan, menyebabkan burnout mentor meningkat drastis.
              </p>
            </div>
            <div className="bg-background p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Kredibilitas Sulit Dibangun</h3>
              <p className="text-muted-foreground leading-relaxed">
                Tidak ada sistem pencatatan jelas, progress sulit dibuktikan, dan sertifikasi tidak terstruktur membuat dampak program sulit diukur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Showcase */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Satu Platform, Tiga Solusi</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fitur yang didesain spesifik untuk setiap stakeholder dalam ekosistem pendidikan Anda.
            </p>
          </div>

          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex p-1 bg-muted rounded-xl">
              <button
                onClick={() => setActiveTab('organisasi')}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === 'organisasi' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Untuk Organisasi
              </button>
              <button
                onClick={() => setActiveTab('mentor')}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === 'mentor' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Untuk Mentor
              </button>
              <button
                onClick={() => setActiveTab('mentee')}
                className={cn(
                  "px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  activeTab === 'mentee' ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Untuk Mentee
              </button>
            </div>
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'organisasi' && (
              <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Partner Management</h3>
                      <p className="text-muted-foreground mb-2">Kelola semua mentor dan mentee dari satu dashboard terpusat.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Koordinasi program 10x lebih efisien, hemat waktu admin hingga 15 jam/minggu.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                      <Layout className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Custom Content Integration</h3>
                      <p className="text-muted-foreground mb-2">Upload dan atur konten pembelajaran sesuai kurikulum organisasi.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Pertahankan identitas program sambil manfaatkan sistem yang proven.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
                      <p className="text-muted-foreground mb-2">Insight real-time tentang engagement, completion rate, dan mentor performance.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Keputusan berbasis data, bukan asumsi.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                      <Palette className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">White-label Options</h3>
                      <p className="text-muted-foreground mb-2">Branding organisasi di seluruh platform (logo, warna, domain).</p>
                      <p className="text-sm font-medium text-primary">Benefit: Mentee tetap merasa "di ekosistem organisasi".</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 shadow-lg">
                   <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-950 relative aspect-square md:aspect-[4/3]">
                     <svg className="w-full h-full text-slate-300 dark:text-slate-700" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Background */}
                        <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02"/>
                        
                        {/* Sidebar */}
                        <rect x="0" y="0" width="60" height="600" fill="currentColor" fillOpacity="0.05"/>
                        {[40, 100, 160, 220].map((y, i) => (
                           <rect key={i} x="15" y={y} width="30" height="30" rx="8" fill="currentColor" fillOpacity={i===0 ? 0.4 : 0.1}/>
                        ))}

                        {/* Top Stats */}
                        {[90, 320, 550].map((x, i) => (
                           <g key={i}>
                              <rect x={x} y="40" width="200" height="100" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                              <circle cx={x+30} cy="70" r="15" fill="currentColor" fillOpacity="0.1"/>
                              <rect x={x+60} y="60" width="80" height="12" rx="4" fill="currentColor" fillOpacity="0.2"/>
                              <rect x={x+30} y="100" width="60" height="20" rx="4" fill="currentColor" fillOpacity="0.4"/>
                           </g>
                        ))}

                        {/* Main Chart */}
                        <rect x="90" y="170" width="430" height="240" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        <polyline points="120,350 180,300 240,320 300,250 360,280 420,200 480,230" stroke="currentColor" strokeWidth="3" fill="none" className="text-blue-500"/>
                        <circle cx="480" cy="230" r="6" fill="white" stroke="currentColor" strokeWidth="2" className="text-blue-500"/>

                        {/* Side Panel / Activity Feed */}
                        <rect x="550" y="170" width="200" height="380" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        {[200, 260, 320, 380, 440, 500].map((y, i) => (
                           <g key={i}>
                              <circle cx="580" cy={y} r="10" fill="currentColor" fillOpacity="0.1"/>
                              <rect x="600" y={y-5} width="120" height="10" rx="4" fill="currentColor" fillOpacity="0.2"/>
                           </g>
                        ))}

                        {/* Bottom List */}
                        <rect x="90" y="440" width="430" height="110" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        <rect x="120" y="460" width="100" height="12" rx="4" fill="currentColor" fillOpacity="0.3"/>
                        {[490, 520].map((y, i) => (
                           <line key={i} x1="120" y1={y} x2="480" y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4"/>
                        ))}
                     </svg>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'mentor' && (
              <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Mentee Tracking</h3>
                      <p className="text-muted-foreground mb-2">Monitor progress setiap mentee dari attendance hingga quiz results.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Fokus ke yang butuh bantuan, bukan terjebak administrasi.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Session Scheduling</h3>
                      <p className="text-muted-foreground mb-2">Atur jadwal mentoring dengan calendar terintegrasi dan reminder otomatis.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Zero missed sessions, mentee dapat notifikasi otomatis.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center shrink-0">
                      <BarChart3 className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Progress Monitoring</h3>
                      <p className="text-muted-foreground mb-2">Timeline visual untuk track milestone dan achievement mentee.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Lihat hasil mentoring secara konkret, bukan sekadar "feeling".</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center shrink-0">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Gamification Tools</h3>
                      <p className="text-muted-foreground mb-2">Badge, leaderboard, dan reward system untuk boost motivasi.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Mentee 3x lebih engaged dengan learning.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 shadow-lg">
                   <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-950 relative aspect-square md:aspect-[4/3]">
                     <svg className="w-full h-full text-slate-300 dark:text-slate-700" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Background */}
                        <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02"/>

                        {/* Calendar Widget */}
                        <rect x="40" y="40" width="280" height="240" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        <rect x="40" y="40" width="280" height="40" rx="12" fill="currentColor" fillOpacity="0.1"/>
                        <rect x="60" y="52" width="100" height="16" rx="4" fill="currentColor" fillOpacity="0.4"/>
                        {/* Grid */}
                        <g transform="translate(60, 100)">
                           {[0, 1, 2, 3].map((row) => (
                              [0, 1, 2, 3, 4, 5, 6].map((col) => (
                                 <circle key={`${row}-${col}`} cx={col * 35} cy={row * 35} r="10" fill="currentColor" fillOpacity={Math.random() > 0.7 ? 0.4 : 0.05} className={Math.random() > 0.8 ? "text-primary" : ""}/>
                              ))
                           ))}
                        </g>

                        {/* Upcoming Session Card */}
                        <rect x="40" y="310" width="280" height="250" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        <circle cx="80" cy="360" r="20" fill="currentColor" fillOpacity="0.2"/>
                        <rect x="120" y="350" width="140" height="20" rx="4" fill="currentColor" fillOpacity="0.3"/>
                        <rect x="60" y="410" width="240" height="120" rx="8" fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeDasharray="4 4"/>

                        {/* Mentee List / Progress */}
                        <rect x="350" y="40" width="410" height="520" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        <rect x="380" y="70" width="150" height="20" rx="4" fill="currentColor" fillOpacity="0.3"/>
                        
                        {[130, 210, 290, 370, 450].map((y, i) => (
                           <g key={i}>
                              <rect x="380" y={y} width="350" height="60" rx="8" fill="currentColor" fillOpacity="0.05"/>
                              <circle cx="410" cy={y+30} r="15" fill="currentColor" fillOpacity="0.2"/>
                              <rect x="440" y={y+20} width="120" height="12" rx="4" fill="currentColor" fillOpacity="0.3"/>
                              <rect x="440" y={y+40} width="80" height="8" rx="4" fill="currentColor" fillOpacity="0.1"/>
                              {/* Status Indicator */}
                              <circle cx="700" cy={y+30} r="6" fill="currentColor" className={i === 0 ? "text-green-500" : i === 2 ? "text-yellow-500" : "text-emerald-500"} fillOpacity="0.8"/>
                           </g>
                        ))}
                     </svg>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'mentee' && (
              <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <PlayCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Video Courses (Modul)</h3>
                      <p className="text-muted-foreground mb-2">Akses konten pembelajaran berkualitas kapan saja, lengkap dengan subtitle.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Belajar sesuai pace sendiri, ulangi materi tanpa awkward.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Quiz Systems</h3>
                      <p className="text-muted-foreground mb-2">Self-assessment otomatis dengan feedback instant.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Tahu langsung di mana kelemahanmu.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-lime-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Attendance Tracking</h3>
                      <p className="text-muted-foreground mb-2">Check-in digital untuk setiap sesi, terintegrasi dengan calendar.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Build habit konsistensi, track rekam jejak.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Credential Building</h3>
                      <p className="text-muted-foreground mb-2">Sertifikat digital verifiable untuk setiap modul completed.</p>
                      <p className="text-sm font-medium text-primary">Benefit: Portfolio skill yang bisa di-share ke LinkedIn.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-2 border border-slate-100 dark:border-slate-800 shadow-lg">
                   <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-950 relative aspect-square md:aspect-[4/3]">
                     <svg className="w-full h-full text-slate-300 dark:text-slate-700" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Background */}
                        <rect width="100%" height="100%" fill="currentColor" fillOpacity="0.02"/>

                        {/* Video Player */}
                        <rect x="40" y="40" width="500" height="320" rx="12" fill="currentColor" fillOpacity="0.1"/>
                        <circle cx="290" cy="200" r="30" fill="white" stroke="currentColor" strokeWidth="4" className="text-primary"/>
                        <polygon points="285,190 305,200 285,210" fill="currentColor" className="text-primary"/>
                        {/* Player Controls */}
                        <rect x="60" y="320" width="460" height="6" rx="3" fill="currentColor" fillOpacity="0.2"/>
                        <rect x="60" y="320" width="200" height="6" rx="3" fill="currentColor" className="text-primary"/>

                        {/* Title and Description */}
                        <rect x="40" y="390" width="300" height="24" rx="4" fill="currentColor" fillOpacity="0.3"/>
                        <rect x="40" y="430" width="450" height="12" rx="4" fill="currentColor" fillOpacity="0.1"/>
                        <rect x="40" y="455" width="400" height="12" rx="4" fill="currentColor" fillOpacity="0.1"/>

                        {/* Sidebar / Curriculum */}
                        <rect x="570" y="40" width="190" height="520" rx="12" stroke="currentColor" strokeWidth="2" fill="white" fillOpacity="0.5"/>
                        <rect x="590" y="70" width="100" height="16" rx="4" fill="currentColor" fillOpacity="0.3"/>
                        
                        {[120, 180, 240, 300, 360, 420, 480].map((y, i) => (
                           <g key={i}>
                              <rect x="590" y={y} width="150" height="40" rx="6" fill="currentColor" fillOpacity={i === 1 ? 0.2 : 0.05} className={i === 1 ? "text-primary" : ""}/>
                              <circle cx="610" cy={y+20} r="8" stroke="currentColor" strokeWidth="2" fill={i < 2 ? "currentColor" : "none"} className={i < 2 ? "text-primary" : ""} />
                              {i < 2 && <path d="M 606 620 L 610 624 L 614 616" stroke="white" strokeWidth="2" transform={`translate(0, ${y - 600})`}/>}
                           </g>
                        ))}
                     </svg>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Mengapa Upgrade ke BelajarShafa?</h2>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border shadow-lg bg-background">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b">
                  <th className="p-6 font-semibold text-muted-foreground w-1/4">Feature</th>
                  <th className="p-6 font-semibold text-muted-foreground w-1/3">Traditional / Manual</th>
                  <th className="p-6 font-bold text-primary w-1/3 bg-primary/5">BelajarShafa</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="p-6 font-medium">Scalability</td>
                  <td className="p-6 text-muted-foreground">1 mentor max 10-15 mentee</td>
                  <td className="p-6 font-medium bg-primary/5">1 mentor handle 50+ mentee</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Consistency</td>
                  <td className="p-6 text-muted-foreground">Kualitas bervariasi per mentor</td>
                  <td className="p-6 font-medium bg-primary/5">Konten terstandar + personalisasi</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Tracking</td>
                  <td className="p-6 text-muted-foreground">Manual via Excel/WhatsApp</td>
                  <td className="p-6 font-medium bg-primary/5">Real-time dashboard & history</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Credibility</td>
                  <td className="p-6 text-muted-foreground">Sertifikat kertas, sulit verifikasi</td>
                  <td className="p-6 font-medium bg-primary/5">Digital verifiable credential</td>
                </tr>
                <tr>
                  <td className="p-6 font-medium">Efficiency</td>
                  <td className="p-6 text-muted-foreground">High overhead (admin manual)</td>
                  <td className="p-6 font-medium bg-primary/5">Automate 70% admin tasks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="testimonials" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Dipercaya oleh Organisasi yang Serius</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="border shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 text-primary">★★★★★</div>
                <p className="text-muted-foreground italic mb-6">"Dulu handle 12 mentee udah burnout. Sekarang bisa 40 mentee tanpa overwhelm—karena admin otomatis, saya fokus conversation quality."</p>
                <div>
                  <div className="font-bold">Ustadz Ahmad Fauzi</div>
                  <div className="text-sm text-muted-foreground">Mentor Senior</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 text-primary">★★★★★</div>
                <p className="text-muted-foreground italic mb-6">"Game changer. Dari 3 program mentoring tersebar jadi 1 ecosystem terintegrasi. Data mentee jelas, mentor happy."</p>
                <div>
                  <div className="font-bold">Siti Nurhaliza</div>
                  <div className="text-sm text-muted-foreground">Program Director</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 text-primary">★★★★★</div>
                <p className="text-muted-foreground italic mb-6">"Platform yang beneran paham mentoring. Video course untuk foundation, lalu mentor guide untuk personalisasi."</p>
                <div>
                  <div className="font-bold">Fadhil Rahman</div>
                  <div className="text-sm text-muted-foreground">Independent Mentor</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-t pt-12 max-w-4xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-sm text-muted-foreground">Active Mentees</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">85</div>
              <div className="text-sm text-muted-foreground">Registered Mentors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">12</div>
              <div className="text-sm text-muted-foreground">Partner Organizations</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">89%</div>
              <div className="text-sm text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Keamanan & Reliabilitas Tanpa Kompromi</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            Anda fokus mendidik, kami pastikan platform berjalan lancar. Data aman, akses cepat, dan selalu tersedia saat dibutuhkan.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-90">
             <div className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-default">
               <Shield className="w-4 h-4 text-emerald-400" /> Keamanan Data Terenkripsi
             </div>
             <div className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-default">
               <Server className="w-4 h-4 text-blue-400" /> 99.9% Uptime Guarantee
             </div>
             <div className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-default">
               <Zap className="w-4 h-4 text-yellow-400" /> Akses Cepat & Ringan
             </div>
             <div className="flex items-center gap-2 px-5 py-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors cursor-default">
               <CheckCircle2 className="w-4 h-4 text-primary" /> Backup Otomatis Berkala
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            Siap Scale Program Mentoring Tanpa Kehilangan Kualitas?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Untuk Organisasi</h3>
                  <p className="text-muted-foreground">Transformasi sistem pendidikan Anda hari ini.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Jadwalkan demo 30 menit
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Lihat dashboard live
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Diskusi kebutuhan spesifik
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Custom pricing
                  </li>
                </ul>
                <Link href="/contact" className="w-full">
                  <Button size="lg" className="w-full">Jadwalkan Demo Gratis</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border shadow-lg">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">Untuk Mentor</h3>
                  <p className="text-muted-foreground">Mulai karir mentoring profesional Anda.</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Daftar dalam 5 menit
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Akses training resources
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Mulai menerima mentee
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Komisi kompetitif
                  </li>
                </ul>
                <Link href="/register?type=mentor" className="w-full">
                  <Button size="lg" variant="outline" className="w-full">Daftar Sebagai Mentor</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground">
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> No credit card required</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 14-day full feature trial</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">BelajarShafa</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary">Terms of Service</Link>
              <Link href="#" className="hover:text-primary">Contact Support</Link>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 BelajarShafa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
