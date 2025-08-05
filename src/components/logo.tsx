
import { BrainCircuit } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-2xl font-bold text-foreground group-data-[collapsible=icon]:hidden">
        Prylics
      </h1>
    </div>
  );
}
