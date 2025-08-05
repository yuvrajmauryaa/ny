import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAiHint: string;
  fundingGoal: number;
  fundingRaised: number;
  circleName: string;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const progress = (project.fundingRaised / project.fundingGoal) * 100;
  const isFunded = progress >= 100;

  return (
    <Card className="overflow-hidden flex flex-col h-full shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48 w-full">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover"
          data-ai-hint={project.imageAiHint}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
        <Badge variant="secondary" className="w-fit">{project.circleName}</Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="line-clamp-4 h-[80px]">{project.description}</CardDescription>
        <div className="mt-6">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span className="font-semibold text-primary">${project.fundingRaised.toLocaleString()}</span>
              <span>Goal: ${project.fundingGoal.toLocaleString()}</span>
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4">
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isFunded}>
          {isFunded ? "Fully Funded" : "Contribute"}
        </Button>
      </CardFooter>
    </Card>
  );
}
