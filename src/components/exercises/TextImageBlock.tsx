interface TextImageBlockProps {
  title: string;
  content: string;
}

export const TextImageBlock = ({ title, content }: TextImageBlockProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="glass-card p-6 rounded-xl">
        <p className="text-lg text-foreground leading-relaxed">{content}</p>
      </div>
    </div>
  );
};