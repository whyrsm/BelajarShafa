import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">BelajarShafa</h1>
      <div className="flex gap-4">
        <Link href="/login" className="p-2 bg-green-500 text-white rounded hover:bg-green-600">
          Login
        </Link>
        <Link href="/register" className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Register
        </Link>
      </div>
    </main>
  );
}
