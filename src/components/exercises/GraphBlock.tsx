import { useState } from "react";
import { Card } from "@/components/ui/card";

interface GraphNode {
  id: string;
  label: string;
  description: string;
}

interface GraphBlockProps {
  title: string;
  nodes: GraphNode[];
}

export const GraphBlock = ({ title, nodes }: GraphBlockProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground text-center">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <Card
            key={node.id}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            className="glass-card p-6 cursor-pointer min-h-[180px] flex flex-col items-center justify-center text-center transition-all hover:scale-105"
          >
            <div className="space-y-3">
              <p className="text-lg font-bold text-foreground">{node.label}</p>
              {hoveredNode === node.id && (
                <p className="text-sm text-foreground/80 animate-fade-in">
                  {node.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};