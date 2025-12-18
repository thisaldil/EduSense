import { ImageSourcePropType } from "react-native";

export type OnboardingSlide = {
  key: string;
  title: string;
  description: string;
  image: ImageSourcePropType;
};

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: "sense",
    title: "Multisensory Learning",
    description:
      "Unlock deep understanding by combining what you see, what you hear, and what you feel. Our AI syncs haptics with audio for true immersion.",
    image: require("@/assets/images/onboarding/slide1.png"),
  },
  {
    key: "assist",
    title: "Adaptive Guidance",
    description:
      "Personalized prompts help you stay on track while learning with sight, sound, and touch working together.",
    image: require("@/assets/images/onboarding/slide2.png"),
  },
  {
    key: "progress",
    title: "Track Your Progress",
    description:
      "See how each session improves comprehension and retention with clear milestones and insights.",
    image: require("@/assets/images/onboarding/slide3.png"),
  },
];
