import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const About = () => {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="container px-4 max-w-4xl">
        <h2 className="mb-8 text-4xl font-bold text-foreground font-serif">About Me</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Avatar className="w-48 h-48 border-4 border-primary/20 shadow-lg shrink-0">
            <AvatarImage src="/assets/profile_pic.JPG" alt="Jacopo Peroni" className="object-cover" />
            <AvatarFallback className="text-4xl font-serif bg-primary/10 text-primary">Jacopo Peroni</AvatarFallback>
          </Avatar>
          <div className="prose prose-lg max-w-none flex-1">
            <p className="text-lg text-foreground/80 leading-relaxed mb-4">
	    I am a PhD student in the Mathematics Cluster of Excellence at the University of Münster under the supervision of <a href="https://www.uni-muenster.de/AMM/en/weber/index.shtml">Prof. Hendrik Weber</a>. 
            </p>
	    <p className="text-lg text-foreground/80 leading-relaxed mb-4">
             My research interests lie in the intersection between mathematical physics and probability.
	     More precisely singular SPDEs and their use to construct rigorously and study QFT's measures.
	     I have a secondary interest in dynamical systems and statistical mechanics.   
	     I am an enthusiast of physics.
	     </p>
	    <p className="text-lg text-foreground/80 leading-relaxed mb-4">
              Before starting my PhD, I completed my master's degree at EPFL under the supervision of <a href="https://www.hairer.org/"> Prof. Martin Hairer</a>. 
            I completed my bachelor's degree at University of Milan.
	      </p>
	    <p className="text-lg text-foreground/80 leading-relaxed mb-4">
		I love music (open to jam!) and mountains.
	    </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
