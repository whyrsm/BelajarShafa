import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Trophy, Sparkles, GraduationCap, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-chart-1/5 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-8 shadow-2xl">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-primary leading-tight">
              Belajar & Tumbuh Bersama
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Terhubung dengan mentor ahli, ikuti kelas yang menarik, dan percepat perjalanan belajar Anda dengan{' '}
              <span className="font-semibold text-foreground">BelajarShafa</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary shadow-2xl text-lg px-8 py-6 group"
                >
                  Mulai Gratis
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 text-lg px-8 py-6 hover:bg-accent"
                >
                  Masuk
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Siswa Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-chart-1 mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Mentor Ahli</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-chart-2 mb-2">100+</div>
                <div className="text-sm text-muted-foreground">Kelas</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Mengapa Pilih{' '}
              <span className="text-primary">
                BelajarShafa
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk sukses dalam perjalanan belajar Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Kelas Interaktif</CardTitle>
                <CardDescription className="text-base">
                  Berinteraksi dengan sesi langsung, tugas, dan materi pembelajaran yang komprehensif
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Mentor Ahli</CardTitle>
                <CardDescription className="text-base">
                  Belajar dari profesional berpengalaman yang bersemangat dalam mengajar
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Lacak Kemajuan</CardTitle>
                <CardDescription className="text-base">
                  Pantau pencapaian Anda dan rayakan tonggak pencapaian sepanjang perjalanan
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Cara Kerjanya</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Mulai dalam tiga langkah sederhana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    1
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mt-2">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Buat Akun Anda</CardTitle>
                  <CardDescription>
                    Daftar sebagai mentee untuk belajar atau sebagai mentor untuk mengajar
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    2
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-chart-1/10 flex items-center justify-center mb-4 mt-2">
                    <Target className="w-7 h-7 text-chart-1" />
                  </div>
                  <CardTitle className="text-xl">Pilih Jalur Anda</CardTitle>
                  <CardDescription>
                    Jelajahi kelas atau buat kursus Anda sendiri untuk berbagi pengetahuan
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-chart-2/10 flex items-center justify-center mb-4 mt-2">
                    <Sparkles className="w-7 h-7 text-chart-2" />
                  </div>
                  <CardTitle className="text-xl">Mulai Belajar</CardTitle>
                  <CardDescription>
                    Berinteraksi dengan konten, lacak kemajuan, dan capai tujuan Anda
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 shadow-2xl overflow-hidden">
            <div className="bg-primary p-12 text-center text-primary-foreground">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Siap Memulai Perjalanan Anda?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Bergabunglah dengan ribuan pembelajar dan mentor hari ini
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-6 group shadow-xl"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                  >
                    Masuk
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">BelajarShafa</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Memberdayakan pembelajar dan mentor untuk mencapai tujuan mereka bersama.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produk</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-primary transition-colors">Fitur</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Harga</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">Tentang Kami</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Sumber Daya</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-primary transition-colors">Dokumentasi</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Dukungan</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Syarat Layanan</Link></li>
                <li><Link href="/cookies" className="hover:text-primary transition-colors">Kebijakan Cookie</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 BelajarShafa. Hak cipta dilindungi.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
