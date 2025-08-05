import ProjectCard from "@/components/project-card";
import type { Project } from "@/components/project-card";

const projects: Project[] = [
    {
      id: '1',
      title: 'Accelerating mRNA Vaccine Development',
      description: 'We are developing a new platform to rapidly create and test mRNA vaccines for emerging infectious diseases. Our goal is to reduce development time from months to weeks.',
      imageUrl: 'https://placehold.co/600x400.png',
      imageAiHint: 'dna helix lab',
      fundingGoal: 150000,
      fundingRaised: 85000,
      circleName: 'AI in Medicine'
    },
    {
      id: '2',
      title: 'Open-Source Carbon Capture Device',
      description: 'This project aims to design and build a low-cost, open-source direct air capture (DAC) device that can be built by individuals and communities to combat climate change.',
      imageUrl: 'https://placehold.co/600x400.png',
      imageAiHint: 'air filters industrial',
      fundingGoal: 75000,
      fundingRaised: 32000,
      circleName: 'Sustainable Agriculture'
    },
    {
      id: '3',
      title: 'Mapping the Brain\'s Neural Connections',
      description: 'By leveraging advanced imaging techniques and machine learning, we are creating the most detailed map of the human brain\'s neural pathways to date. This will unlock new insights into neurological disorders.',
      imageUrl: 'https://placehold.co/600x400.png',
      imageAiHint: 'brain mri scan',
      fundingGoal: 500000,
      fundingRaised: 450000,
      circleName: 'Neuroscience Collective'
    },
    {
        id: '4',
        title: 'Quantum Entanglement Communication',
        description: 'We are building a prototype for a secure communication system using the principles of quantum entanglement, making it virtually unhackable. This could revolutionize data security.',
        imageUrl: 'https://placehold.co/600x400.png',
        imageAiHint: 'quantum computer',
        fundingGoal: 200000,
        fundingRaised: 98000,
        circleName: 'Quantum Computing'
    }
  ];
  
export default function CrowdfundingPage() {
    return (
        <div className="w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="space-y-4 mb-8">
                    <h1 className="font-headline text-3xl font-bold text-foreground">Crowdfund Science</h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Support groundbreaking research and innovative projects from the community. Your contribution can make a difference.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            </div>
        </div>
    )
}
