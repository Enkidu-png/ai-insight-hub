import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";
import { toast } from "sonner";

const feedbackSchema = z.object({
  usefulness: z.number().min(1, "Wybierz ocenę przydatności").max(5),
  usefulnessComment: z.string().optional(),
  questions: z.string().min(5, "Opisz swoje pytania (min. 5 znaków)"),
  missing: z.array(z.string()).min(1, "Wybierz przynajmniej jedną opcję"),
  nextTopics: z.array(z.string()).min(1, "Wybierz przynajmniej jeden temat"),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const Feedback = () => {
  const navigate = useNavigate();
  const [selectedMissing, setSelectedMissing] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
  });

  const usefulnessComment = watch("usefulnessComment");

  const onSubmit = (data: FeedbackForm) => {
    console.log("Feedback data:", data);
    toast.success("Dziękujemy za feedback! 🎉");
    setTimeout(() => navigate("/thank-you"), 1500);
  };

  const handleMissingToggle = (item: string) => {
    const newItems = selectedMissing.includes(item)
      ? selectedMissing.filter(i => i !== item)
      : [...selectedMissing, item];
    setSelectedMissing(newItems);
    setValue("missing", newItems);
  };

  const handleTopicToggle = (topic: string) => {
    const newTopics = selectedTopics.includes(topic)
      ? selectedTopics.filter(t => t !== topic)
      : [...selectedTopics, topic];
    setSelectedTopics(newTopics);
    setValue("nextTopics", newTopics);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 text-foreground">
            Twoja Opinia Ma Znaczenie
          </h1>
          <p className="text-center text-foreground/70 mb-8">
            Pomóż nam tworzyć lepsze treści
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Question 1 - Usefulness Rating */}
            <div className="space-y-4">
              <Label className="text-base font-semibold block">
                1. Jak przydatny dla Ciebie był ten film?
              </Label>

              <div className="flex gap-3 justify-center md:justify-start">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => {
                      setSelectedRating(rating);
                      setValue("usefulness", rating);
                    }}
                    className={`w-14 h-14 rounded-2xl font-bold text-lg transition-all duration-200 ${
                      selectedRating === rating
                        ? "bg-accent text-white scale-110 shadow-lg shadow-accent/30"
                        : "glass-input hover:bg-accent/20 text-foreground"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              {selectedRating && (
                <div className="text-sm text-foreground/60 text-center">
                  {selectedRating === 1 && "Niestety, film nie spełnił Twoich oczekiwań"}
                  {selectedRating === 2 && "Film zawierał trochę przydatnych informacji"}
                  {selectedRating === 3 && "Film był przeciętnie przydatny"}
                  {selectedRating === 4 && "Film był raczej przydatny"}
                  {selectedRating === 5 && "Świetny film! Bardzo mi się przydał"}
                </div>
              )}

              <Textarea
                id="usefulnessComment"
                placeholder="(opcjonalnie) Dodaj komentarz do swojej oceny..."
                className="glass-input rounded-xl min-h-24 resize-none"
                {...register("usefulnessComment")}
              />
              {errors.usefulness && <p className="text-sm text-destructive">{errors.usefulness.message}</p>}
            </div>

            {/* Question 2 */}
            <div className="space-y-3">
              <Label htmlFor="questions" className="text-base font-semibold">
                2. Jakie masz teraz pytania lub wątpliwości związane z prompt engineeringiem?
              </Label>
              <Textarea 
                id="questions"
                placeholder="Opisz swoje pytania..."
                className="glass-input rounded-xl min-h-32 resize-none"
                {...register("questions")}
              />
              {errors.questions && <p className="text-sm text-destructive">{errors.questions.message}</p>}
            </div>

            {/* Question 3 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">3. Czego zabrakło Ci w tym filmie? (możesz wybrać kilka)</Label>
              <div className="space-y-2">
                {[
                  "Więcej praktycznych przykładów",
                  "Gotowych szablonów do pobrania",
                  "Głębszego wyjaśnienia teorii",
                  "Przypadków użycia z Twojej branży",
                  "Porównania różnych modeli AI",
                  "Nic, film był kompletny",
                  "Inne"
                ].map((item) => (
                  <div key={item} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <Checkbox 
                      id={`missing-${item}`}
                      checked={selectedMissing.includes(item)}
                      onCheckedChange={() => handleMissingToggle(item)}
                    />
                    <Label htmlFor={`missing-${item}`} className="cursor-pointer flex-1">{item}</Label>
                  </div>
                ))}
              </div>
              {errors.missing && <p className="text-sm text-destructive">{errors.missing.message}</p>}
            </div>

            {/* Question 4 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">4. Który temat chciałbyś zobaczyć w następnym filmie? (możesz wybrać kilka)</Label>
              <div className="space-y-2">
                {[
                  "Zaawansowane techniki promptów dla programistów",
                  "AI w marketingu i content creation",
                  "Automatyzacja procesów biznesowych z AI",
                  "Analiza danych i Business Intelligence",
                  "AI w projektowaniu i kreatywności",
                  "Budowanie własnych AI agentów",
                  "Etyka i bezpieczeństwo AI",
                  "Inne"
                ].map((topic) => (
                  <div key={topic} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <Checkbox 
                      id={`topic-${topic}`}
                      checked={selectedTopics.includes(topic)}
                      onCheckedChange={() => handleTopicToggle(topic)}
                    />
                    <Label htmlFor={`topic-${topic}`} className="cursor-pointer flex-1">{topic}</Label>
                  </div>
                ))}
              </div>
              {errors.nextTopics && <p className="text-sm text-destructive">{errors.nextTopics.message}</p>}
            </div>

            <Button 
              type="submit"
              size="lg"
              className="w-full h-14 text-lg rounded-2xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
            >
              Wyślij opinię
              <Send className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
