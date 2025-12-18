import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Typography } from "@/constants/theme";
import { OnboardingSlide } from "../data/slides";

type Props = {
  slide: OnboardingSlide;
};

export function OnboardingSlideCard({ slide }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.heroWrapper}>
        <Image source={slide.image} style={styles.hero} contentFit="contain" />
      </View>

      <View style={styles.textArea}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  heroWrapper: {
    width: "100%",
    maxWidth: 360,
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
    // backgroundColor: "#E6ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    width: "90%",
    height: "90%",
  },
  textArea: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  title: {
    ...Typography.h2,
    color: Colors.light.text,
    textAlign: "center",
  },
  description: {
    ...Typography.body,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
