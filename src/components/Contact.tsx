import { Mail, Building2, Github, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section id="contact" className="py-20 bg-section-bg">
      <div className="container px-4 max-w-4xl">
        <h2 className="mb-12 text-4xl font-bold text-foreground text-center font-serif">Contact me!</h2>
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Email</h3>
                  <a href="mailto:jacopo.peroni@uni-muenster.de" className="text-muted-foreground hover:text-primary transition-colors">
                    jacopo.peroni@uni-muenster.de
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-card-foreground mb-1">Office</h3>
                  <p className="text-muted-foreground">
                    Room 130.020<br />
                    Orléans-Ring 10<br />
                    48149 Münster
 		    </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-semibold text-card-foreground mb-3">Connect</h3>
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="justify-start" asChild>
                  <a href="https://linkedin.com/in/jacopo-peroni-488321143" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
