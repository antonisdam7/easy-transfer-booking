import { MapPin } from "lucide-react";

const destinations = [
  { name: "Heraklion", desc: "The capital of Crete, home to the famous Knossos Palace and a vibrant city center." },
  { name: "Chania", desc: "A charming old town with a stunning Venetian harbor and colorful streets." },
  { name: "Rethymno", desc: "A blend of Ottoman and Venetian architecture with a beautiful sandy beach." },
  { name: "Elounda", desc: "A luxury resort area near Agios Nikolaos with crystal-clear waters." },
  { name: "Hersonissos", desc: "A lively resort town popular for nightlife and beautiful beaches." },
  { name: "Agios Nikolaos", desc: "A picturesque coastal town built around the stunning Lake Voulismeni." },
  { name: "Plakias", desc: "A laid-back beach village on the south coast surrounded by mountains." },
  { name: "Matala", desc: "Famous for its ancient caves and bohemian atmosphere." },
  { name: "Sitia", desc: "A peaceful eastern town known for its wine and hospitality." },
];

const Crete = () => (
  <div className="min-h-screen bg-background">
    <div className="container max-w-4xl py-16 px-4">
      <h1 className="text-3xl font-display font-bold text-primary mb-2">Discover Crete</h1>
      <p className="text-muted-foreground text-lg mb-10">
        We cover every corner of the island. Here are some of the top destinations we serve.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {destinations.map((d) => (
          <div key={d.name} className="bg-card rounded-lg p-5 shadow-card border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-accent" />
              <h3 className="font-display font-semibold text-primary">{d.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{d.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Crete;
