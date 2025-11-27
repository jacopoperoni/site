import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const Publications = () => {
  const papers = [
   {
      title: () => (
 	<>
	 Quasi shift invariance of <InlineMath math="\Phi^4" /> measures
	</> 
      ), 
      authors: "Martin Hairer, Jacopo Peroni",
      venue: "working on...",
     // year: "2025",
     // link: "#",
     // description: "Description of the paper's key findings and impact on the research community."
    }
  ];

  return (
    <section id="publications" className="py-20 bg-section-bg">
      <div className="container px-4 max-w-5xl">
        <h2 className="mb-12 text-4xl font-bold text-foreground font-serif">Publications and preprints</h2>
        <div className="space-y-6">
          {papers.map((paper, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground font-serif">
                    {paper.title()}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {paper.authors}
                  </p>
                  <p className="text-sm font-medium text-primary mb-3">
                    {paper.venue}, {paper.year}
                  </p>
                  <p className="text-card-foreground/80 leading-relaxed">
                    {paper.description}
                  </p>
                </div>
                <a 
                  href={paper.link}
                  className="flex-shrink-0 p-2 text-primary hover:text-accent transition-colors"
                  aria-label="View paper"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Publications;
