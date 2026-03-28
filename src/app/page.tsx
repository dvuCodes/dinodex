import { Suspense } from "react";
import { getAllDinos } from "@/lib/data";
import { Header } from "@/components/Header";
import { DinoGrid } from "@/components/DinoGrid";

export default function HomePage() {
  const dinos = getAllDinos();

  return (
    <>
      <Header />
      <main id="main-content" className="max-w-[1200px] mx-auto px-4 py-4">
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-12 rounded-card bg-white/70 border border-border-default shimmer" />
              <div className="h-22 rounded-card bg-white/70 border border-border-default shimmer" />
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div
                    key={index}
                    className="aspect-[3/4] rounded-card bg-white/70 border border-border-default shimmer"
                  />
                ))}
              </div>
            </div>
          }
        >
          <DinoGrid dinos={dinos} />
        </Suspense>
      </main>
    </>
  );
}
