import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-3xl p-8 md:p-12 max-w-2xl w-full animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-foreground">
          Witaj w Świecie AI
        </h1>
        
        <p className="text-lg md:text-xl text-foreground/80 text-center mb-8 leading-relaxed">
          Odkryj sekrety efektywnej pracy z narzędziami AI. 
          Naucz się tworzyć prompty, które przynoszą rezultaty.
        </p>
        
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6 border-primary/20">
            <h3 className="font-semibold text-lg mb-2">Co Cię czeka?</h3>
            <ul className="space-y-2 text-foreground/70">
              <li>• Praktyczne techniki prompt engineeringu</li>
              <li>• Gotowe szablony do wykorzystania</li>
              <li>• Przykłady z różnych branż</li>
              <li>• Wskazówki od ekspertów</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => navigate("/survey")}
            size="lg"
            className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            Weź Udział
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        
        <p className="text-sm text-foreground/50 text-center mt-6">
          Zajmie Ci to tylko kilka minut
        </p>
      </div>
    </div>
  );
};

export default Welcome;
