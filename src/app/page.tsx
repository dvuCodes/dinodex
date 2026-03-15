import { getAllDinos } from "@/lib/data";
import { Header } from "@/components/Header";
import { DinoGrid } from "@/components/DinoGrid";

export default function HomePage() {
  const dinos = getAllDinos();

  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-4">
        <DinoGrid dinos={dinos} />
      </main>
    </>
  );
}
