import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const surveySchema = z.object({
  profession: z.string().min(1, "Wybierz swoją rolę zawodową"),
  experience: z.string().min(1, "Wybierz poziom doświadczenia"),
  aiAreas: z.array(z.string()).min(1, "Wybierz przynajmniej jeden obszar"),
  email: z.string().email("Podaj prawidłowy adres email"),
  challenge: z.string().min(1, "Wybierz swoje największe wyzwanie"),
  expectations: z.string().min(1, "Wybierz swoje oczekiwania"),
  timeSpent: z.string().min(1, "Wybierz ile czasu spędzasz z AI"),
  frustration: z.string().min(10, "Opisz swoją frustrację (min. 10 znaków)"),
});

type SurveyForm = z.infer<typeof surveySchema>;

const Survey = () => {
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<SurveyForm>({
    resolver: zodResolver(surveySchema),
  });

  const onSubmit = (data: SurveyForm) => {
    console.log("Survey data:", data);
    toast.success("Dziękujemy za wypełnienie ankiety!");
    navigate("/video");
  };

  const handleAreaToggle = (area: string) => {
    const newAreas = selectedAreas.includes(area)
      ? selectedAreas.filter(a => a !== area)
      : [...selectedAreas, area];
    setSelectedAreas(newAreas);
    setValue("aiAreas", newAreas);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            📋 Poznajmy się!
          </h1>
          <p className="text-center text-foreground/70 mb-8">
            Ankieta przed filmem - pomoże nam lepiej dostosować treści
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Question 1 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">1. Kim jesteś zawodowo?</Label>
              <RadioGroup onValueChange={(value) => setValue("profession", value)}>
                {[
                  "Programista/Developer",
                  "Marketer/Content Creator",
                  "Przedsiębiorca/Właściciel biznesu",
                  "Student/Osoba ucząca się",
                  "Projektant/Designer",
                  "Analityk danych",
                  "Inne"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.profession && <p className="text-sm text-destructive">{errors.profession.message}</p>}
            </div>

            {/* Question 2 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">2. Jak oceniasz swoje doświadczenie z AI?</Label>
              <RadioGroup onValueChange={(value) => setValue("experience", value)}>
                {[
                  "Początkujący - dopiero zaczynam",
                  "Podstawowy - używam od czasu do czasu",
                  "Średniozaawansowany - używam regularnie",
                  "Zaawansowany - to moje codzienne narzędzie"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <RadioGroupItem value={option} id={`exp-${option}`} />
                    <Label htmlFor={`exp-${option}`} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.experience && <p className="text-sm text-destructive">{errors.experience.message}</p>}
            </div>

            {/* Question 3 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">3. W jakich obszarach korzystasz z AI? (możesz wybrać kilka)</Label>
              <div className="space-y-2">
                {[
                  "Tworzenie treści/copywriting",
                  "Programowanie i debugging kodu",
                  "Analiza i przetwarzanie danych",
                  "Automatyzacja zadań biznesowych",
                  "Brainstorming i kreatywność",
                  "Nauka i edukacja",
                  "Inne"
                ].map((area) => (
                  <div key={area} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <Checkbox 
                      id={`area-${area}`}
                      checked={selectedAreas.includes(area)}
                      onCheckedChange={() => handleAreaToggle(area)}
                    />
                    <Label htmlFor={`area-${area}`} className="cursor-pointer flex-1">{area}</Label>
                  </div>
                ))}
              </div>
              {errors.aiAreas && <p className="text-sm text-destructive">{errors.aiAreas.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold">Twój adres email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="twoj@email.com"
                className="glass-input rounded-xl h-12"
                {...register("email")}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            {/* Question 4 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">4. Co jest Twoim największym wyzwaniem w pracy z AI?</Label>
              <RadioGroup onValueChange={(value) => setValue("challenge", value)}>
                {[
                  "Nie wiem jak konstruować skuteczne prompty",
                  "Wyniki są niskiej jakości lub nieprecyzyjne",
                  "Zbyt wiele prób zanim otrzymam dobry rezultat",
                  "Nie znam zaawansowanych technik",
                  "Brak pomysłów na praktyczne zastosowania",
                  "Inne"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <RadioGroupItem value={option} id={`challenge-${option}`} />
                    <Label htmlFor={`challenge-${option}`} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.challenge && <p className="text-sm text-destructive">{errors.challenge.message}</p>}
            </div>

            {/* Question 5 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">5. Czego oczekujesz po tym filmie?</Label>
              <RadioGroup onValueChange={(value) => setValue("expectations", value)}>
                {[
                  "Konkretnych szablonów promptów",
                  "Zrozumienia podstawowych zasad",
                  "Zaawansowanych technik i tricków",
                  "Przykładów z życia wzięte",
                  "Inspiracji do mojej pracy",
                  "Inne"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <RadioGroupItem value={option} id={`expect-${option}`} />
                    <Label htmlFor={`expect-${option}`} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.expectations && <p className="text-sm text-destructive">{errors.expectations.message}</p>}
            </div>

            {/* Question 6 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">6. Ile czasu tygodniowo spędzasz z AI?</Label>
              <RadioGroup onValueChange={(value) => setValue("timeSpent", value)}>
                {[
                  "Mniej niż 1 godzina",
                  "1-5 godzin",
                  "5-10 godzin",
                  "10-20 godzin",
                  "Powyżej 20 godzin"
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2 glass-input rounded-xl p-3">
                    <RadioGroupItem value={option} id={`time-${option}`} />
                    <Label htmlFor={`time-${option}`} className="cursor-pointer flex-1">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.timeSpent && <p className="text-sm text-destructive">{errors.timeSpent.message}</p>}
            </div>

            {/* Question 7 */}
            <div className="space-y-3">
              <Label htmlFor="frustration" className="text-base font-semibold">
                7. Co najbardziej frustruje Cię w obecnej pracy z AI?
              </Label>
              <Textarea 
                id="frustration"
                placeholder="Opisz swoje frustracje..."
                className="glass-input rounded-xl min-h-32 resize-none"
                {...register("frustration")}
              />
              {errors.frustration && <p className="text-sm text-destructive">{errors.frustration.message}</p>}
            </div>

            <Button 
              type="submit"
              size="lg"
              className="w-full h-14 text-lg rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              Przejdź do filmu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Survey;
