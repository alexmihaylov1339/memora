async function getDecks() {
  const base = process.env.NEXT_PUBLIC_API_URL!;
  const res = await fetch(`${base}/v1/decks`, { cache: 'no-store' });

  if (!res.ok) throw new Error('Failed to fetch decks');
  return res.json() as Promise<Array<{ id: string; name: string; count: number }>>;
}

export default async function DecksPage() {
  const decks = await getDecks();

  return (
    <main style={{ padding: 24 }}>
      <h1>Decks</h1>
      <ul>
        {decks.map(d => (
          <li key={d.id}>
            <strong>{d.name}</strong> — {d.count} cards
          </li>
        ))}
      </ul>
    </main>
  );
}
