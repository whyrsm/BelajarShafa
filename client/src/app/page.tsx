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
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Fitur</Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">Testimoni</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Harga</Link>
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
            <Link href="#features" className="text-sm font-medium p-2 hover:bg-muted rounded-md">Fitur</Link>
            <Link href="#testimonials" className="text-sm font-medium p-2 hover:bg-muted rounded-md">Testimoni</Link>
            <Link href="#pricing" className="text-sm font-medium p-2 hover:bg-muted rounded-md">Harga</Link>
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
            Platform Mentoring #1 untuk Organisasi Islam
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-tight text-slate-900 dark:text-slate-50">
            Sistem Mentoring yang <span className="text-primary">Scale</span> Tanpa Kehilangan Esensi Pendidikan Karakter
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Platform mentoring management dan LMS yang membantu organisasi pendidikan Islam mengelola program berkualitas untuk ratusan mentee—tanpa mentor kewalahan, tanpa peserta tersesat.
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
            <div className="rounded-lg overflow-hidden bg-slate-100 aspect-[16/9] relative group">
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 group-hover:bg-slate-900/0 transition-colors">
                 {/* This would be a real screenshot in production */}
                 <div className="grid grid-cols-4 grid-rows-3 gap-4 w-full h-full p-8 opacity-40">
                    <div className="col-span-1 row-span-3 bg-white rounded-lg shadow-sm"></div>
                    <div className="col-span-3 row-span-1 bg-white rounded-lg shadow-sm flex items-center px-4 gap-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    </div>
                    <div className="col-span-2 row-span-2 bg-white rounded-lg shadow-sm"></div>
                    <div className="col-span-1 row-span-2 bg-white rounded-lg shadow-sm"></div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-muted-foreground border">
                      Dashboard Preview
                    </span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
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
                <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-center border">
                   {/* Placeholder for Organization Dashboard Visual */}
                   <div className="text-center text-muted-foreground">
                     <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                     <p>Organization Dashboard Interface</p>
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
                <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-center border">
                   {/* Placeholder for Mentor Dashboard Visual */}
                   <div className="text-center text-muted-foreground">
                     <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                     <p>Mentor Dashboard Interface</p>
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
                <div className="bg-slate-100 rounded-2xl p-6 flex items-center justify-center border">
                   {/* Placeholder for Mentee Dashboard Visual */}
                   <div className="text-center text-muted-foreground">
                     <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                     <p>Mentee Learning Interface</p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Built with Modern Tech Stack</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-12">
            Kami percaya transparansi membangun trust. BelajarShafa dibangun dengan teknologi modern yang proven untuk handle growth.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-70">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
               <Zap className="w-4 h-4" /> Next.js
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
               <Server className="w-4 h-4" /> Nest.js
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
               <Layout className="w-4 h-4" /> Tailwind CSS
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
               <Shield className="w-4 h-4" /> Enterprise Encryption
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
