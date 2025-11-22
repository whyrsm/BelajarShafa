import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BookOpen, Users, Trophy, Sparkles, GraduationCap, Target } from 'lucide-react';

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
              Learn & Grow Together
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Connect with expert mentors, join engaging classes, and accelerate your learning journey with{' '}
              <span className="font-semibold text-foreground">BelajarShafa</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary shadow-2xl text-lg px-8 py-6 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 text-lg px-8 py-6 hover:bg-accent"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1000+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-chart-1 mb-2">50+</div>
                <div className="text-sm text-muted-foreground">Expert Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-chart-2 mb-2">100+</div>
                <div className="text-sm text-muted-foreground">Courses</div>
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
              Why Choose{' '}
              <span className="text-primary">
                BelajarShafa
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to succeed in your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Interactive Classes</CardTitle>
                <CardDescription className="text-base">
                  Engage with live sessions, assignments, and comprehensive learning materials
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Expert Mentors</CardTitle>
                <CardDescription className="text-base">
                  Learn from experienced professionals who are passionate about teaching
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:shadow-xl transition-shadow group">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Track Progress</CardTitle>
                <CardDescription className="text-base">
                  Monitor your achievements and celebrate milestones along the way
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
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
                  <CardTitle className="text-xl">Create Your Account</CardTitle>
                  <CardDescription>
                    Sign up as a mentee to learn or as a mentor to teach
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
                  <CardTitle className="text-xl">Choose Your Path</CardTitle>
                  <CardDescription>
                    Browse classes or create your own course to share knowledge
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
                  <CardTitle className="text-xl">Start Learning</CardTitle>
                  <CardDescription>
                    Engage with content, track progress, and achieve your goals
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
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of learners and mentors today
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 py-6 group shadow-xl"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary text-lg px-8 py-6"
                  >
                    Sign In
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
                Empowering learners and mentors to achieve their goals together.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/support" className="hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 BelajarShafa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
