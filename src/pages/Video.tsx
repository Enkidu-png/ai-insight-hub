import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Video = () => {
  const navigate = useNavigate();
  const [videoWatched, setVideoWatched] = useState(false);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            🎥 Mistrzowskie Prompty AI
          </h1>

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden glass-card border-2 border-white/30 mb-8 aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="AI Prompt Engineering Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoWatched(true)}
            />
          </div>

          {/* Video Description */}
          <div className="glass-card rounded-2xl p-6 mb-8 border-primary/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              O czym jest ten film?
            </h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                W tym kompleksowym przewodniku dowiesz się, jak tworzyć prompty, które przynoszą 
                rzeczywiste rezultaty. Odkryjesz sprawdzone techniki używane przez ekspertów.
              </p>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">📚 Czego się nauczysz:</h3>
                <ul className="space-y-2 ml-4">
                  <li>• Podstawowe zasady skutecznego prompt engineeringu</li>
                  <li>• Zaawansowane techniki optymalizacji promptów</li>
                  <li>• Gotowe szablony dla różnych zastosowań</li>
                  <li>• Praktyczne przykłady z różnych branż</li>
                  <li>• Najczęstsze błędy i jak ich unikać</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">🎯 Dla kogo:</h3>
                <p>
                  Ten film jest idealny dla wszystkich, którzy chcą poprawić swoją efektywność 
                  w pracy z AI - od początkujących po zaawansowanych użytkowników.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/feedback")}
            size="lg"
            disabled={!videoWatched}
            className="w-full h-14 text-lg rounded-2xl bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
          >
            {videoWatched ? "Przejdź do ankiety końcowej" : "Oglądaj film, aby kontynuować"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Video;
