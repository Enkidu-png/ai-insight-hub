import { Button } from "@/components/ui/button";
import { CheckCircle2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Dziękujemy! 🎉
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed">
          Twoja opinia jest dla nas niezwykle cenna. Dzięki Twojemu feedbackowi 
          możemy tworzyć jeszcze lepsze treści edukacyjne.
        </p>
        
        <div className="glass-card rounded-2xl p-6 mb-8 border-primary/20">
          <h3 className="font-semibold text-lg mb-3">📬 Co dalej?</h3>
          <div className="space-y-2 text-foreground/70 text-left">
            <p>• Wkrótce wyślemy Ci dostęp do premium materiałów</p>
            <p>• Otrzymasz powiadomienie o nowych filmach</p>
            <p>• Dołączysz do ekskluzywnej społeczności AI enthusiastów</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-foreground/60">
            Sprawdź swoją skrzynkę email w ciągu 24 godzin
          </p>
          
          <Button 
            onClick={() => navigate("/")}
            size="lg"
            variant="outline"
            className="glass-input border-primary/30 hover:bg-white/50"
          >
            <Home className="mr-2 h-5 w-5" />
            Powrót do strony głównej
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
