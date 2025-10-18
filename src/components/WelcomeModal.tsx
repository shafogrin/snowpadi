import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Heart, Users } from "lucide-react";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
}

const WelcomeModal = ({ open, onClose, username }: WelcomeModalProps) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      title: `Welcome, ${username}!`,
      description: "You've joined SnowPadi - a safe space for emotional support and knowledge sharing. We're glad you're here!",
    },
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: "Stay Anonymous, Stay Safe",
      description: "Your identity is protected. Share your thoughts freely without fear of judgment. We all use anonymous usernames here.",
    },
    {
      icon: <Heart className="w-12 h-12 text-primary" />,
      title: "Earn Reputation",
      description: "Build your reputation by posting helpful content and engaging with the community. Every post earns you 5 points, every comment 2 points!",
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "You've Earned Your First Badge! 🌱",
      description: "The \"Fresh Padi\" badge shows you're part of our community. Keep participating to unlock more badges!",
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  useEffect(() => {
    if (!open) {
      setStep(0);
    }
  }, [open]);

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      localStorage.setItem("snowpadi_welcome_shown", "true");
    } else {
      setStep(step + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4 animate-scale-in">
            {currentStep.icon}
          </div>
          <DialogTitle className="text-center text-2xl">
            {currentStep.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === step
                    ? "w-8 bg-primary"
                    : index < step
                    ? "w-2 bg-primary/50"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <Button onClick={handleNext} size="lg" className="w-full">
            {isLastStep ? "Start Exploring" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
