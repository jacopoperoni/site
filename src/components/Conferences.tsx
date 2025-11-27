import { Card } from "@/components/ui/card";
import { Calendar, MapPin } from "lucide-react";

const Conferences = () => {
  const conferences = [
    {
      name: "International Conference Name",
      type: "Oral Presentation",
      location: "City, Country",
      date: "Month Year",
      title: "Title of Your Presentation"
    },
    {
      name: "Another Conference Name",
      type: "Poster Presentation",
      location: "City, Country",
      date: "Month Year",
      title: "Title of Your Poster"
    },
    {
      name: "Workshop Name",
      type: "Panel Discussion",
      location: "City, Country",
      date: "Month Year",
      title: "Discussion Topic"
    }
  ];

  return (
    <section id="conferences" className="py-20 bg-background">
      <div className="container px-4 max-w-5xl">
        <h2 className="mb-12 text-4xl font-bold text-foreground font-serif">Conferences & Talks</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {conferences.map((conf, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-border bg-card">
              <div className="mb-3">
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-accent/10 text-accent mb-3">
                  {conf.type}
                </span>
                <h3 className="text-lg font-semibold text-card-foreground font-serif">
                  {conf.name}
                </h3>
              </div>
              <p className="text-card-foreground/90 mb-4 leading-relaxed">
                {conf.title}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{conf.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{conf.date}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Conferences;
