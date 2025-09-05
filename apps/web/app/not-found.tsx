export default function NotFound() {
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-gray-600">The page you’re looking for does not exist.</p>
      <div className="flex gap-2">
        <a className="rounded bg-black text-white px-4 py-2" href="/">Go home</a>
        <a className="rounded border px-4 py-2" href="/book/service">Book an appointment</a>
      </div>
    </main>
  );
}

